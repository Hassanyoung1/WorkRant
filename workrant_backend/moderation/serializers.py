"""
Serializers for moderation app.

SECURITY RULES:
- No PII in moderation data
- Reporter anonymity preserved
- Admin actions properly logged
- Sensitive audit data handled securely
"""

from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Report, AdminAuditLog, AuditLink


class ReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reports."""
    
    # Generic foreign key fields
    content_type = serializers.CharField(write_only=True)
    object_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Report
        fields = [
            'content_type',
            'object_id',
            'reason',
            'description'
        ]
    
    def validate_content_type(self, value):
        """Validate content type."""
        allowed_types = ['post', 'comment', 'user']
        if value not in allowed_types:
            raise serializers.ValidationError(
                f'Content type must be one of: {", ".join(allowed_types)}'
            )
        return value
    
    def validate_description(self, value):
        """Validate report description."""
        if value and len(value) > 1000:
            raise serializers.ValidationError(
                'Description must be less than 1000 characters'
            )
        return value
    
    def create(self, validated_data):
        """Create report with proper content type."""
        content_type_name = validated_data.pop('content_type')
        
        # Map content type names to actual ContentType objects
        content_type_mapping = {
            'post': 'posts.post',
            'comment': 'posts.comment',
            'user': 'accounts.user'
        }
        
        try:
            app_label, model = content_type_mapping[content_type_name].split('.')
            content_type = ContentType.objects.get(
                app_label=app_label,
                model=model
            )
        except (ContentType.DoesNotExist, KeyError):
            raise serializers.ValidationError('Invalid content type')
        
        # Create report
        report = Report.objects.create(
            reporter_user=self.context['request'].user,
            content_type=content_type,
            **validated_data
        )
        
        return report


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for report display (admin only)."""
    
    reporter_pseudonym = serializers.CharField(
        source='reporter_user.pseudonym',
        read_only=True
    )
    handler_pseudonym = serializers.CharField(
        source='handled_by.pseudonym',
        read_only=True
    )
    content_type_name = serializers.CharField(
        source='content_type.model',
        read_only=True
    )
    
    class Meta:
        model = Report
        fields = [
            'id',
            'reporter_pseudonym',
            'content_type_name',
            'object_id',
            'reason',
            'description',
            'status',
            'handler_pseudonym',
            'resolution_notes',
            'created_at',
            'updated_at',
            'resolved_at'
        ]
        read_only_fields = [
            'id',
            'reporter_pseudonym',
            'content_type_name',
            'created_at',
            'updated_at',
            'resolved_at'
        ]


class ReportActionSerializer(serializers.Serializer):
    """Serializer for taking action on reports."""
    
    action = serializers.ChoiceField(
        choices=['resolve', 'dismiss', 'escalate'],
        required=True
    )
    
    resolution_notes = serializers.CharField(
        max_length=1000,
        required=False,
        allow_blank=True
    )
    
    def validate(self, attrs):
        """Validate report action."""
        action = attrs.get('action')
        notes = attrs.get('resolution_notes', '')
        
        if action in ['resolve', 'dismiss'] and not notes:
            raise serializers.ValidationError(
                'Resolution notes are required for resolve/dismiss actions'
            )
        
        return attrs


class AdminAuditLogSerializer(serializers.ModelSerializer):
    """Serializer for admin audit logs."""
    
    admin_pseudonym = serializers.CharField(
        source='admin_user.pseudonym',
        read_only=True
    )
    target_type = serializers.CharField(
        source='target_content_type.model',
        read_only=True
    )
    
    class Meta:
        model = AdminAuditLog
        fields = [
            'id',
            'admin_pseudonym',
            'action',
            'target_type',
            'target_object_id',
            'reason',
            'created_at'
        ]
        read_only_fields = fields


class ModerationStatsSerializer(serializers.Serializer):
    """Serializer for moderation dashboard stats."""
    
    total_reports = serializers.IntegerField(read_only=True)
    open_reports = serializers.IntegerField(read_only=True)
    reports_today = serializers.IntegerField(read_only=True)
    reports_this_week = serializers.IntegerField(read_only=True)
    
    # Report breakdown by reason
    reports_by_reason = serializers.DictField(read_only=True)
    
    # Recent admin actions
    recent_actions = AdminAuditLogSerializer(many=True, read_only=True)


class ContentModerationSerializer(serializers.Serializer):
    """Serializer for content moderation actions."""
    
    action = serializers.ChoiceField(
        choices=[
            'hide',
            'unhide',
            'delete',
            'ban_user',
            'unban_user'
        ],
        required=True
    )
    
    reason = serializers.CharField(
        max_length=500,
        required=True,
        help_text="Reason for the moderation action"
    )
    
    duration_days = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=365,
        help_text="Duration for temporary actions (e.g., temporary bans)"
    )
    
    def validate(self, attrs):
        """Validate moderation action."""
        action = attrs.get('action')
        
        # Some actions might require duration
        if action == 'ban_user' and not attrs.get('duration_days'):
            # Default to permanent ban if no duration specified
            attrs['duration_days'] = None
        
        return attrs


class AuditLinkSerializer(serializers.ModelSerializer):
    """Serializer for audit links (admin only, no decryption)."""
    
    created_by_pseudonym = serializers.CharField(
        source='created_by.pseudonym',
        read_only=True
    )
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditLink
        fields = [
            'id',
            'reference_type',
            'reference_id',
            'requires_legal_hold',
            'created_by_pseudonym',
            'purpose',
            'created_at',
            'expires_at',
            'is_expired'
        ]
        read_only_fields = fields
    
    def get_is_expired(self, obj):
        """Check if audit link has expired."""
        return obj.is_expired()


class ReportListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for report lists."""
    
    reporter_pseudonym = serializers.CharField(
        source='reporter_user.pseudonym',
        read_only=True
    )
    content_type_name = serializers.CharField(
        source='content_type.model',
        read_only=True
    )
    
    class Meta:
        model = Report
        fields = [
            'id',
            'reporter_pseudonym',
            'content_type_name',
            'reason',
            'status',
            'created_at'
        ]
        read_only_fields = fields
