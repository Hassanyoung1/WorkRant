"""
Admin configuration for companies app.
"""

from django.contrib import admin
from .models import Company, CompanyRating


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    """Admin for Company model."""
    
    list_display = [
        'name',
        'slug',
        'industry',
        'post_count',
        'is_suspect',
        'created_at'
    ]
    
    list_filter = [
        'industry',
        'is_suspect',
        'created_at'
    ]
    
    search_fields = ['name', 'slug']
    
    readonly_fields = ['id', 'slug', 'created_at', 'post_count']
    
    fieldsets = (
        ('Company Information', {
            'fields': ('id', 'name', 'slug', 'industry')
        }),
        ('Moderation', {
            'fields': ('is_suspect',)
        }),
        ('Statistics', {
            'fields': ('post_count', 'created_at')
        }),
    )
    
    ordering = ['-created_at']
    
    def post_count(self, obj):
        """Get number of posts for this company."""
        return obj.posts.filter(is_deleted=False, is_hidden=False).count()
    post_count.short_description = 'Posts'


@admin.register(CompanyRating)
class CompanyRatingAdmin(admin.ModelAdmin):
    """Admin for CompanyRating model."""
    
    list_display = [
        'company',
        'user_pseudonym',
        'fairness',
        'work_life_balance',
        'management_toxicity',
        'average_score',
        'created_at'
    ]
    
    list_filter = [
        'fairness',
        'work_life_balance',
        'management_toxicity',
        'created_at'
    ]
    
    search_fields = ['company__name', 'user__pseudonym']
    
    readonly_fields = ['id', 'created_at', 'average_score']
    
    fieldsets = (
        ('Rating Information', {
            'fields': ('id', 'company', 'user')
        }),
        ('Ratings', {
            'fields': ('fairness', 'work_life_balance', 'management_toxicity', 'average_score')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )
    
    ordering = ['-created_at']
    
    def user_pseudonym(self, obj):
        """Get user pseudonym."""
        return obj.user.pseudonym if obj.user else 'Deleted User'
    user_pseudonym.short_description = 'User'
