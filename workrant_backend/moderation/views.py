"""
Views for moderation app.

SECURITY RULES:
- Admin-only access for most moderation functions
- No PII in moderation responses
- Proper audit logging for all admin actions
- Anonymous reporting system
"""

from rest_framework import status, permissions, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from datetime import timedelta

from .models import Report, AdminAuditLog, AuditLink
from .serializers import (
    ReportCreateSerializer,
    ReportSerializer,
    ReportActionSerializer,
    ReportListSerializer,
    AdminAuditLogSerializer,
    ModerationStatsSerializer,
    ContentModerationSerializer
)
from posts.models import Post, Comment
from accounts.models import User


class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Custom permission for staff-only write access.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.is_staff


class ReportCreateView(APIView):
    """
    Create new report.
    
    Anonymous reporting system for content violations.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ReportCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            report = serializer.save()
            
            return Response({
                'id': report.id,
                'message': 'Report submitted successfully',
                'disclaimer': 'Reports are reviewed by moderators. Thank you for helping keep WorkRant safe.'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReportListView(generics.ListAPIView):
    """
    List reports (staff only).
    
    Shows all reports with filtering options.
    """
    serializer_class = ReportListSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = Report.objects.all().select_related(
            'reporter_user',
            'handled_by',
            'content_type'
        )
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by reason
        reason = self.request.query_params.get('reason')
        if reason:
            queryset = queryset.filter(reason=reason)
        
        # Filter by content type
        content_type = self.request.query_params.get('content_type')
        if content_type:
            try:
                ct = ContentType.objects.get(model=content_type)
                queryset = queryset.filter(content_type=ct)
            except ContentType.DoesNotExist:
                pass
        
        return queryset.order_by('-created_at')


class ReportDetailView(generics.RetrieveAPIView):
    """
    Get report details (staff only).
    
    Shows full report information with content context.
    """
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    queryset = Report.objects.all()


class ReportActionView(APIView):
    """
    Take action on reports (staff only).
    
    Allows staff to resolve, dismiss, or escalate reports.
    """
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def post(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            return Response(
                {'error': 'Report not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ReportActionSerializer(data=request.data)
        
        if serializer.is_valid():
            action = serializer.validated_data['action']
            notes = serializer.validated_data.get('resolution_notes', '')
            
            # Update report
            if action == 'resolve':
                report.mark_resolved(request.user, notes)
                
                # Log admin action
                AdminAuditLog.objects.create(
                    admin_user=request.user,
                    action='resolve_report',
                    reason=notes,
                    related_report=report,
                    metadata={'report_reason': report.reason}
                )
                
            elif action == 'dismiss':
                report.status = 'dismissed'
                report.handled_by = request.user
                report.resolution_notes = notes
                report.resolved_at = timezone.now()
                report.save()
                
                # Log admin action
                AdminAuditLog.objects.create(
                    admin_user=request.user,
                    action='dismiss_report',
                    reason=notes,
                    related_report=report,
                    metadata={'report_reason': report.reason}
                )
            
            elif action == 'escalate':
                report.status = 'reviewing'
                report.handled_by = request.user
                report.resolution_notes = f"Escalated: {notes}"
                report.save()
            
            return Response({
                'message': f'Report {action}d successfully',
                'report': ReportSerializer(report).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContentModerationView(APIView):
    """
    Moderate content (staff only).
    
    Hide/unhide/delete posts and comments, ban/unban users.
    """
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def post(self, request, content_type, object_id):
        # Validate content type
        if content_type not in ['post', 'comment', 'user']:
            return Response(
                {'error': 'Invalid content type'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ContentModerationSerializer(data=request.data)
        
        if serializer.is_valid():
            action = serializer.validated_data['action']
            reason = serializer.validated_data['reason']
            
            # Get the target object
            target_object = None
            try:
                if content_type == 'post':
                    target_object = Post.objects.get(id=object_id)
                elif content_type == 'comment':
                    target_object = Comment.objects.get(id=object_id)
                elif content_type == 'user':
                    target_object = User.objects.get(id=object_id)
            except (Post.DoesNotExist, Comment.DoesNotExist, User.DoesNotExist):
                return Response(
                    {'error': f'{content_type.title()} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Perform the action
            if action == 'hide' and hasattr(target_object, 'is_hidden'):
                target_object.is_hidden = True
                target_object.save()
                
            elif action == 'unhide' and hasattr(target_object, 'is_hidden'):
                target_object.is_hidden = False
                target_object.save()
                
            elif action == 'delete' and hasattr(target_object, 'is_deleted'):
                target_object.is_deleted = True
                target_object.save()
                
            elif action == 'ban_user' and content_type == 'user':
                target_object.is_banned = True
                target_object.save()
                
            elif action == 'unban_user' and content_type == 'user':
                target_object.is_banned = False
                target_object.save()
            
            else:
                return Response(
                    {'error': 'Invalid action for content type'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Log the action
            ct = ContentType.objects.get_for_model(target_object)
            AdminAuditLog.objects.create(
                admin_user=request.user,
                action=f"{action}_{content_type}",
                target_content_type=ct,
                target_object_id=target_object.id,
                reason=reason,
                metadata={
                    'content_type': content_type,
                    'action': action
                }
            )
            
            return Response({
                'message': f'{content_type.title()} {action}d successfully',
                'action': action,
                'target': str(target_object.id)
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, permissions.IsAdminUser])
def moderation_stats(request):
    """
    Get moderation dashboard statistics.
    
    Returns summary of reports, actions, and trends.
    """
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    
    # Calculate stats
    stats = {
        'total_reports': Report.objects.count(),
        'open_reports': Report.objects.filter(status='open').count(),
        'reports_today': Report.objects.filter(created_at__date=today).count(),
        'reports_this_week': Report.objects.filter(created_at__date__gte=week_ago).count(),
        
        'reports_by_reason': dict(
            Report.objects.values('reason').annotate(count=Count('id'))
            .values_list('reason', 'count')
        ),
        
        'recent_actions': AdminAuditLogSerializer(
            AdminAuditLog.objects.select_related('admin_user')
            .order_by('-created_at')[:10],
            many=True
        ).data
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, permissions.IsAdminUser])
def admin_audit_logs(request):
    """
    Get admin audit logs.
    
    Returns paginated list of all admin actions.
    """
    logs = AdminAuditLog.objects.select_related(
        'admin_user',
        'target_content_type'
    ).order_by('-created_at')
    
    # Filter by admin user
    admin_id = request.query_params.get('admin')
    if admin_id:
        logs = logs.filter(admin_user_id=admin_id)
    
    # Filter by action
    action = request.query_params.get('action')
    if action:
        logs = logs.filter(action=action)
    
    # Paginate (simplified)
    page_size = 50
    page = int(request.query_params.get('page', 1))
    start = (page - 1) * page_size
    end = start + page_size
    
    serializer = AdminAuditLogSerializer(logs[start:end], many=True)
    
    return Response({
        'results': serializer.data,
        'page': page,
        'has_next': len(logs) > end,
        'total': logs.count()
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def report_reasons(request):
    """
    Get available report reasons.
    
    Returns list of valid report reasons for frontend.
    """
    return Response({
        'reasons': [
            {'value': choice[0], 'label': choice[1]}
            for choice in Report.REASON_CHOICES
        ]
    })
