"""
Moderation models for WorkRant.

SECURITY RULES:
- No PII in moderation logs
- All reports are anonymous
- Audit trails for admin actions
- Encrypted audit links for sensitive mappings
"""

import uuid
from django.db import models
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey


class Report(models.Model):
    """
    Report model for user-submitted content reports.
    
    Users can report posts, comments, or other users for violations.
    Reports are anonymous and don't expose reporter identity.
    """
    
    # Report reasons
    REASON_CHOICES = [
        ('pii', 'Contains Personal Information'),
        ('harassment', 'Harassment or Bullying'),
        ('hate_speech', 'Hate Speech'),
        ('spam', 'Spam or Low Quality'),
        ('threats', 'Threats or Violence'),
        ('doxxing', 'Doxxing/Personal Information'),
        ('illegal', 'Illegal Content'),
        ('other', 'Other Violation'),
    ]
    
    # Report status
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('reviewing', 'Under Review'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]
    
    # UUID primary key
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )
    
    # Reporter (anonymous, nullable for privacy)
    reporter_user = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='submitted_reports',
        help_text="User who submitted the report (nullable for anonymity)"
    )
    
    # Generic relation to reported content
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Report details
    reason = models.CharField(
        max_length=20,
        choices=REASON_CHOICES,
        help_text="Reason for the report"
    )
    
    description = models.TextField(
        blank=True,
        help_text="Additional details from reporter"
    )
    
    # Moderation metadata (no PII)
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Sanitized metadata (no PII)"
    )
    
    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open'
    )
    
    # Admin handling
    handled_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='handled_reports',
        help_text="Admin who handled this report"
    )
    
    resolution_notes = models.TextField(
        blank=True,
        help_text="Admin notes on resolution"
    )
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'reports'
        verbose_name = 'Report'
        verbose_name_plural = 'Reports'
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['reason']),
        ]
    
    def __str__(self):
        return f"Report: {self.reason} - {self.status}"
    
    def mark_resolved(self, admin_user, notes=""):
        """Mark report as resolved."""
        self.status = 'resolved'
        self.handled_by = admin_user
        self.resolution_notes = notes
        self.resolved_at = timezone.now()
        self.save()


class AdminAuditLog(models.Model):
    """
    Audit log for admin actions.
    
    Tracks all moderation actions for accountability.
    Does not store PII.
    """
    
    ACTION_CHOICES = [
        ('hide_post', 'Hide Post'),
        ('unhide_post', 'Unhide Post'),
        ('delete_post', 'Delete Post'),
        ('hide_comment', 'Hide Comment'),
        ('unhide_comment', 'Unhide Comment'),
        ('delete_comment', 'Delete Comment'),
        ('ban_user', 'Ban User'),
        ('unban_user', 'Unban User'),
        ('resolve_report', 'Resolve Report'),
        ('dismiss_report', 'Dismiss Report'),
    ]
    
    # UUID primary key
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )
    
    # Admin who performed the action
    admin_user = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,  # Never delete audit logs
        related_name='admin_actions'
    )
    
    # Action details
    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES
    )
    
    # Target of the action (generic relation)
    target_content_type = models.ForeignKey(
        ContentType, 
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    target_object_id = models.UUIDField(null=True, blank=True)
    target_object = GenericForeignKey('target_content_type', 'target_object_id')
    
    # Additional context
    reason = models.TextField(
        help_text="Reason for the action"
    )
    
    # Related report (if applicable)
    related_report = models.ForeignKey(
        'moderation.Report',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Metadata (no PII)
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional action metadata (no PII)"
    )
    
    # Timestamp (immutable)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'admin_audit_logs'
        verbose_name = 'Admin Audit Log'
        verbose_name_plural = 'Admin Audit Logs'
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['admin_user', '-created_at']),
            models.Index(fields=['action']),
        ]
    
    def __str__(self):
        return f"{self.action} by @{self.admin_user.pseudonym} at {self.created_at}"


class AuditLink(models.Model):
    """
    Encrypted audit links for sensitive mappings.
    
    Stores encrypted payloads that map to sensitive data.
    Requires dual-control access and KMS for decryption.
    """
    
    # UUID primary key
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )
    
    # Reference type and ID
    reference_type = models.CharField(
        max_length=50,
        help_text="Type of referenced object (e.g., 'post', 'user')"
    )
    
    reference_id = models.UUIDField(
        help_text="ID of the referenced object"
    )
    
    # Encrypted payload (never stored in plain text)
    encrypted_payload = models.BinaryField(
        help_text="Encrypted JSON payload (requires KMS to decrypt)"
    )
    
    # Access control
    requires_legal_hold = models.BooleanField(
        default=False,
        help_text="True if legal hold prevents deletion"
    )
    
    # Metadata
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        help_text="Admin who created this audit link"
    )
    
    purpose = models.CharField(
        max_length=100,
        help_text="Purpose of this audit link"
    )
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this audit link expires (if applicable)"
    )
    
    class Meta:
        db_table = 'audit_links'
        verbose_name = 'Audit Link'
        verbose_name_plural = 'Audit Links'
        indexes = [
            models.Index(fields=['reference_type', 'reference_id']),
            models.Index(fields=['created_at']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"Audit Link: {self.reference_type}:{self.reference_id}"
    
    def is_expired(self):
        """Check if audit link has expired."""
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at
