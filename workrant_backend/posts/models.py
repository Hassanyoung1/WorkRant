"""
Post and Comment models for WorkRant.

SECURITY RULES:
- All content must pass PII filtering before save
- No direct user identification, only pseudonyms
- Soft delete for legal compliance
- UUIDs for all primary keys
"""

import uuid
import re
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError


def validate_no_pii(content):
    """
    Validate that content doesn't contain obvious PII.
    
    This is a basic regex-based check. More sophisticated
    filtering should be implemented in views/serializers.
    """
    # Email pattern
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'
    if re.search(email_pattern, content):
        raise ValidationError('Content contains email address')
    
    # Nigerian phone number pattern
    phone_pattern = r'\b(?:0|\+?234)[0-9]{10,}\b'
    if re.search(phone_pattern, content):
        raise ValidationError('Content contains phone number')
    
    # Basic NIN pattern (11 digits)
    nin_pattern = r'\b\d{11}\b'
    if re.search(nin_pattern, content):
        raise ValidationError('Content may contain NIN or other sensitive number')


class Post(models.Model):
    """
    Post model for WorkRant.
    
    Represents workplace rants/reviews posted by users.
    Content is filtered for PII before saving.
    """
    
    # UUID primary key
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )
    
    # References
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='posts',
        help_text="Author (nullable for anonymity)"
    )
    
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.SET_NULL,
        null=True,
        related_name='posts',
        help_text="Company being discussed"
    )
    
    # Content
    title = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Optional post title"
    )
    
    body = models.TextField(
        help_text="Main post content",
        validators=[validate_no_pii]
    )
    
    # Media URLs (stored in external service)
    media_urls = models.JSONField(
        default=list,
        blank=True,
        help_text="List of media URLs (max 5)"
    )
    
    # Tags for categorization
    tags = models.JSONField(
        default=list,
        blank=True,
        help_text="List of tags (e.g., ['#salary', '#harassment'])"
    )
    
    # Engagement metrics
    score = models.IntegerField(
        default=0,
        help_text="Calculated score based on votes"
    )
    
    # Moderation status
    is_hidden = models.BooleanField(
        default=False,
        help_text="Hidden by moderators"
    )
    
    is_deleted = models.BooleanField(
        default=False,
        help_text="Soft-deleted by user or moderator"
    )
    
    deleted_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When the post was deleted"
    )
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'posts'
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'
        indexes = [
            models.Index(fields=['company', '-created_at']),
            models.Index(fields=['-score']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['is_hidden', 'is_deleted']),
        ]
    
    def save(self, *args, **kwargs):
        """Override save to set deleted_at when soft deleting."""
        if self.is_deleted and not self.deleted_at:
            self.deleted_at = timezone.now()
        elif not self.is_deleted:
            self.deleted_at = None
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        title = self.title or self.body[:50]
        return f"Post: {title}... by @{self.user.pseudonym if self.user else 'deleted'}"
    
    @property
    def vote_count(self):
        """Get total vote count (up - down)."""
        return self.votes.filter(vote=1).count() - self.votes.filter(vote=-1).count()
    
    @property
    def comment_count(self):
        """Get number of comments."""
        return self.comments.filter(is_deleted=False).count()
    
    def get_display_content(self):
        """Get content with disclaimer for display."""
        disclaimer = "\n\n--- \nOpinions expressed are anonymous and unverified."
        return self.body + disclaimer


class Comment(models.Model):
    """
    Comment model for WorkRant.
    
    Represents comments on posts.
    Supports basic threading with parent_id.
    """
    
    # UUID primary key
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )
    
    # References
    post = models.ForeignKey(
        'posts.Post',
        on_delete=models.CASCADE,
        related_name='comments'
    )
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='comments'
    )
    
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        help_text="Parent comment for threading"
    )
    
    # Content
    body = models.TextField(
        help_text="Comment content",
        validators=[validate_no_pii]
    )
    
    # Moderation status
    is_hidden = models.BooleanField(
        default=False,
        help_text="Hidden by moderators"
    )
    
    is_deleted = models.BooleanField(
        default=False,
        help_text="Soft-deleted"
    )
    
    # Timestamp
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'comments'
        verbose_name = 'Comment'
        verbose_name_plural = 'Comments'
        indexes = [
            models.Index(fields=['post', '-created_at']),
            models.Index(fields=['parent']),
        ]
    
    def __str__(self):
        content = self.body[:50]
        return f"Comment: {content}... by @{self.user.pseudonym if self.user else 'deleted'}"


class Vote(models.Model):
    """
    Vote model for posts.
    
    Users can upvote (1) or downvote (-1) posts.
    One vote per user per post.
    """
    
    # UUID primary key
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )
    
    # References
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='votes'
    )
    
    post = models.ForeignKey(
        'posts.Post',
        on_delete=models.CASCADE,
        related_name='votes'
    )
    
    # Vote value (1 for upvote, -1 for downvote)
    vote = models.SmallIntegerField(
        choices=[(1, 'Upvote'), (-1, 'Downvote')],
        help_text="1 for upvote, -1 for downvote"
    )
    
    # Timestamp
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'votes'
        verbose_name = 'Vote'
        verbose_name_plural = 'Votes'
        unique_together = ['user', 'post']
        indexes = [
            models.Index(fields=['post', 'vote']),
        ]
    
    def __str__(self):
        vote_type = "upvote" if self.vote == 1 else "downvote"
        return f"{vote_type} by @{self.user.pseudonym if self.user else 'deleted'}"
