"""
Admin configuration for moderation app.

SECURITY RULES:
- Strict access controls for moderation data
- No PII exposure in admin interface
- Proper audit trails for all actions
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Report, AdminAuditLog, AuditLink


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    """Admin for Report model."""
    
    list_display = [
        'reason',
        'content_info',
        'reporter_pseudonym',
        'status',
        'handler_pseudonym',
        'created_at'
    ]
    
    list_filter = [
        'reason',
        'status',
        'content_type',
        'created_at'
    ]
    
    search_fields = [
        'reason',
        'description',
        'reporter_user__pseudonym',
        'handled_by__pseudonym'
    ]
    
    readonly_fields = [
        'id',
        'content_type',
        'object_id',
        'created_at',
        'updated_at'
    ]
    
    fieldsets = (
        ('Report Information', {
            'fields': ('id', 'reason', 'description')
        }),
        ('Reported Content', {
            'fields': ('content_type', 'object_id')
        }),
        ('Reporter', {
            'fields': ('reporter_user',)
        }),
        ('Status', {
            'fields': ('status', 'handled_by', 'resolution_notes')
        }),
        ('Metadata', {
            'fields': ('metadata',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at')
        }),
    )
    
    ordering = ['status', '-created_at']
    date_hierarchy = 'created_at'
    list_per_page = 50

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'reporter_user', 'handled_by', 'content_type'
        )
    
    actions = ['mark_resolved', 'mark_dismissed']
    
    def content_info(self, obj):
        """Get content type and ID."""
        return f"{obj.content_type.model}:{str(obj.object_id)[:8]}"
    content_info.short_description = 'Content'
    
    def reporter_pseudonym(self, obj):
        """Get reporter pseudonym."""
        return obj.reporter_user.pseudonym if obj.reporter_user else 'Anonymous'
    reporter_pseudonym.short_description = 'Reporter'
    
    def handler_pseudonym(self, obj):
        """Get handler pseudonym."""
        return obj.handled_by.pseudonym if obj.handled_by else 'Unhandled'
    handler_pseudonym.short_description = 'Handler'
    
    def mark_resolved(self, request, queryset):
        """Mark reports as resolved."""
        count = queryset.filter(status='open').update(
            status='resolved',
            handled_by=request.user
        )
        self.message_user(request, f'{count} reports marked as resolved.')
    mark_resolved.short_description = 'Mark as resolved'
    
    def mark_dismissed(self, request, queryset):
        """Mark reports as dismissed."""
        count = queryset.filter(status='open').update(
            status='dismissed',
            handled_by=request.user
        )
        self.message_user(request, f'{count} reports dismissed.')
    mark_dismissed.short_description = 'Mark as dismissed'


@admin.register(AdminAuditLog)
class AdminAuditLogAdmin(admin.ModelAdmin):
    """Admin for AdminAuditLog model."""
    
    list_display = [
        'action',
        'admin_pseudonym',
        'target_info',
        'reason_excerpt',
        'created_at'
    ]
    
    list_filter = [
        'action',
        'admin_user',
        'target_content_type',
        'created_at'
    ]
    
    search_fields = [
        'action',
        'reason',
        'admin_user__pseudonym'
    ]
    
    readonly_fields = [
        'id',
        'admin_user',
        'action',
        'target_content_type',
        'target_object_id',
        'reason',
        'related_report',
        'metadata',
        'created_at'
    ]
    
    fieldsets = (
        ('Action Information', {
            'fields': ('id', 'admin_user', 'action', 'reason')
        }),
        ('Target', {
            'fields': ('target_content_type', 'target_object_id')
        }),
        ('Context', {
            'fields': ('related_report', 'metadata')
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        }),
    )
    
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    list_per_page = 50

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'admin_user', 'target_content_type', 'related_report'
        )
    
    def has_add_permission(self, request):
        """Prevent manual creation of audit logs."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of audit logs."""
        return False
    
    def admin_pseudonym(self, obj):
        """Get admin pseudonym."""
        return obj.admin_user.pseudonym
    admin_pseudonym.short_description = 'Admin'
    
    def target_info(self, obj):
        """Get target information."""
        if obj.target_content_type and obj.target_object_id:
            return f"{obj.target_content_type.model}:{str(obj.target_object_id)[:8]}"
        return 'N/A'
    target_info.short_description = 'Target'
    
    def reason_excerpt(self, obj):
        """Get reason excerpt."""
        return obj.reason[:50] + '...' if len(obj.reason) > 50 else obj.reason
    reason_excerpt.short_description = 'Reason'


@admin.register(AuditLink)
class AuditLinkAdmin(admin.ModelAdmin):
    """Admin for AuditLink model."""
    
    list_display = [
        'reference_type',
        'reference_id_short',
        'purpose',
        'created_by_pseudonym',
        'requires_legal_hold',
        'is_expired',
        'created_at'
    ]
    
    list_filter = [
        'reference_type',
        'requires_legal_hold',
        'created_at',
        'expires_at'
    ]
    
    search_fields = [
        'reference_type',
        'purpose',
        'created_by__pseudonym'
    ]
    
    readonly_fields = [
        'id',
        'encrypted_payload',
        'created_at',
        'is_expired_status'
    ]
    
    fieldsets = (
        ('Reference Information', {
            'fields': ('id', 'reference_type', 'reference_id')
        }),
        ('Audit Data', {
            'fields': ('encrypted_payload', 'purpose')
        }),
        ('Access Control', {
            'fields': ('requires_legal_hold', 'created_by')
        }),
        ('Expiration', {
            'fields': ('expires_at', 'is_expired_status')
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        }),
    )
    
    ordering = ['-created_at']
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion unless legal hold is cleared."""
        if obj and obj.requires_legal_hold:
            return False
        return super().has_delete_permission(request, obj)
    
    def reference_id_short(self, obj):
        """Get short reference ID."""
        return str(obj.reference_id)[:8]
    reference_id_short.short_description = 'Ref ID'
    
    def created_by_pseudonym(self, obj):
        """Get creator pseudonym."""
        return obj.created_by.pseudonym
    created_by_pseudonym.short_description = 'Created By'
    
    def is_expired_status(self, obj):
        """Get expiration status with styling."""
        if obj.is_expired():
            return format_html('<span style="color: red;">Expired</span>')
        elif obj.expires_at:
            return format_html('<span style="color: orange;">Active</span>')
        else:
            return format_html('<span style="color: green;">No Expiration</span>')
    is_expired_status.short_description = 'Status'
