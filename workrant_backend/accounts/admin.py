"""
Admin configuration for accounts app.

SECURITY RULES:
- Limited admin access to user data
- No PII display in admin interface
- Proper permissions for user management
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for User model."""
    
    # Display fields
    list_display = [
        'pseudonym',
        'persistent',
        'is_active',
        'is_staff',
        'is_banned',
        'created_at'
    ]
    
    list_filter = [
        'persistent',
        'is_active',
        'is_staff',
        'is_banned',
        'created_at'
    ]
    
    search_fields = ['pseudonym', 'pseudonym_normalized']
    
    readonly_fields = [
        'id',
        'pseudonym_normalized',
        'created_at',
        'last_login'
    ]
    
    # Form organization
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'pseudonym', 'pseudonym_normalized')
        }),
        ('Account Type', {
            'fields': ('persistent', 'recovery_token_hash')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_banned')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'last_login')
        }),
    )
    
    add_fieldsets = (
        ('Create User', {
            'classes': ('wide',),
            'fields': ('pseudonym', 'password1', 'password2', 'persistent')
        }),
    )
    
    ordering = ['-created_at']
    
    def get_queryset(self, request):
        """Limit queryset for non-superusers."""
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            # Regular staff can only see non-staff users
            qs = qs.filter(is_staff=False)
        return qs
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of user accounts."""
        return False  # Soft delete only
    
    def save_model(self, request, obj, form, change):
        """Override save to handle password setting."""
        if not change:  # Creating new user
            obj.set_password(form.cleaned_data.get('password1', ''))
        super().save_model(request, obj, form, change)
