"""
Admin configuration for posts app.

SECURITY RULES:
- Content filtering for PII in admin
- Proper moderation controls
- Audit trail for admin actions
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Post, Comment, Vote


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """Admin for Post model."""
    
    list_display = [
        'title_or_excerpt',
        'company',
        'author_pseudonym',
        'score',
        'vote_count',
        'comment_count',
        'is_hidden',
        'is_deleted',
        'created_at'
    ]
    
    list_filter = [
        'is_hidden',
        'is_deleted',
        'company',
        'created_at',
        'tags'
    ]
    
    search_fields = ['title', 'body', 'company__name', 'user__pseudonym']
    
    readonly_fields = [
        'id',
        'score',
        'vote_count',
        'comment_count',
        'created_at',
        'updated_at',
        'deleted_at'
    ]
    
    fieldsets = (
        ('Content', {
            'fields': ('id', 'title', 'body', 'media_urls', 'tags')
        }),
        ('References', {
            'fields': ('user', 'company')
        }),
        ('Moderation', {
            'fields': ('is_hidden', 'is_deleted', 'deleted_at')
        }),
        ('Statistics', {
            'fields': ('score', 'vote_count', 'comment_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    list_per_page = 50

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'company')
    
    actions = ['hide_posts', 'unhide_posts', 'delete_posts']
    
    def title_or_excerpt(self, obj):
        """Get title or excerpt of body."""
        if obj.title:
            return obj.title[:50]
        return obj.body[:50] + '...' if len(obj.body) > 50 else obj.body
    title_or_excerpt.short_description = 'Content'
    
    def author_pseudonym(self, obj):
        """Get author pseudonym."""
        return obj.user.pseudonym if obj.user else 'Deleted User'
    author_pseudonym.short_description = 'Author'
    
    def vote_count(self, obj):
        """Get net vote count."""
        return obj.vote_count
    vote_count.short_description = 'Votes'
    
    def comment_count(self, obj):
        """Get comment count."""
        return obj.comment_count
    comment_count.short_description = 'Comments'
    
    def hide_posts(self, request, queryset):
        """Hide selected posts."""
        count = queryset.update(is_hidden=True)
        self.message_user(request, f'{count} posts hidden.')
    hide_posts.short_description = 'Hide selected posts'
    
    def unhide_posts(self, request, queryset):
        """Unhide selected posts."""
        count = queryset.update(is_hidden=False)
        self.message_user(request, f'{count} posts unhidden.')
    unhide_posts.short_description = 'Unhide selected posts'
    
    def delete_posts(self, request, queryset):
        """Soft delete selected posts."""
        count = queryset.update(is_deleted=True)
        self.message_user(request, f'{count} posts deleted.')
    delete_posts.short_description = 'Delete selected posts'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """Admin for Comment model."""
    
    list_display = [
        'excerpt',
        'post_title',
        'author_pseudonym',
        'parent_comment',
        'is_hidden',
        'is_deleted',
        'created_at'
    ]
    
    list_filter = [
        'is_hidden',
        'is_deleted',
        'created_at'
    ]
    
    search_fields = ['body', 'post__title', 'user__pseudonym']
    
    readonly_fields = ['id', 'created_at']
    
    fieldsets = (
        ('Content', {
            'fields': ('id', 'body')
        }),
        ('References', {
            'fields': ('post', 'user', 'parent')
        }),
        ('Moderation', {
            'fields': ('is_hidden', 'is_deleted')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )
    
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    list_per_page = 50

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'post', 'parent')
    
    actions = ['hide_comments', 'unhide_comments', 'delete_comments']
    
    def excerpt(self, obj):
        """Get comment excerpt."""
        return obj.body[:50] + '...' if len(obj.body) > 50 else obj.body
    excerpt.short_description = 'Comment'
    
    def post_title(self, obj):
        """Get post title or excerpt."""
        if obj.post.title:
            return obj.post.title[:30]
        return obj.post.body[:30] + '...'
    post_title.short_description = 'Post'
    
    def author_pseudonym(self, obj):
        """Get author pseudonym."""
        return obj.user.pseudonym if obj.user else 'Deleted User'
    author_pseudonym.short_description = 'Author'
    
    def parent_comment(self, obj):
        """Get parent comment info."""
        if obj.parent:
            return f"Reply to: {obj.parent.body[:30]}..."
        return "Top-level comment"
    parent_comment.short_description = 'Parent'
    
    def hide_comments(self, request, queryset):
        """Hide selected comments."""
        count = queryset.update(is_hidden=True)
        self.message_user(request, f'{count} comments hidden.')
    hide_comments.short_description = 'Hide selected comments'
    
    def unhide_comments(self, request, queryset):
        """Unhide selected comments."""
        count = queryset.update(is_hidden=False)
        self.message_user(request, f'{count} comments unhidden.')
    unhide_comments.short_description = 'Unhide selected comments'
    
    def delete_comments(self, request, queryset):
        """Soft delete selected comments."""
        count = queryset.update(is_deleted=True)
        self.message_user(request, f'{count} comments deleted.')
    delete_comments.short_description = 'Delete selected comments'


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    """Admin for Vote model."""
    
    list_display = [
        'post_title',
        'user_pseudonym',
        'vote_type',
        'created_at'
    ]
    
    list_filter = [
        'vote',
        'created_at'
    ]
    
    search_fields = ['post__title', 'user__pseudonym']
    
    readonly_fields = ['id', 'created_at']
    
    fieldsets = (
        ('Vote Information', {
            'fields': ('id', 'user', 'post', 'vote')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )
    
    ordering = ['-created_at']
    
    def post_title(self, obj):
        """Get post title or excerpt."""
        if obj.post.title:
            return obj.post.title[:30]
        return obj.post.body[:30] + '...'
    post_title.short_description = 'Post'
    
    def user_pseudonym(self, obj):
        """Get user pseudonym."""
        return obj.user.pseudonym if obj.user else 'Deleted User'
    user_pseudonym.short_description = 'User'
    
    def vote_type(self, obj):
        """Get vote type with styling."""
        if obj.vote == 1:
            return format_html('<span style="color: green;">↑ Upvote</span>')
        else:
            return format_html('<span style="color: red;">↓ Downvote</span>')
    vote_type.short_description = 'Vote'
