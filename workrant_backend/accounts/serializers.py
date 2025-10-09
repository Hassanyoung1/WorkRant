"""
Serializers for accounts app.

SECURITY RULES:
- Never expose user IDs in responses
- Only expose pseudonyms in public contexts
- Validate all inputs for PII
- Password-related fields properly handled
"""

import re
import secrets
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import User


class UserRegistrationSerializer(serializers.Serializer):
    """Serializer for user registration."""
    
    pseudonym = serializers.CharField(
        max_length=64,
        required=True,
        help_text="Unique pseudonym for the user"
    )
    
    persistent = serializers.BooleanField(
        default=False,
        help_text="Whether to create a password-protected account"
    )
    
    password = serializers.CharField(
        write_only=True,
        required=False,
        help_text="Password for persistent accounts"
    )
    
    def validate_pseudonym(self, value):
        """Validate pseudonym format and uniqueness."""
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Pseudonym must be at least 3 characters long"
            )
        
        # Check for forbidden patterns (no real names or emails)
        if '@' in value:
            raise serializers.ValidationError(
                "Pseudonym cannot contain @ symbol"
            )
        
        if re.search(r'\b(admin|root|moderator|workrant)\b', value.lower()):
            raise serializers.ValidationError(
                "This pseudonym is reserved"
            )
        
        # Check uniqueness
        if User.objects.filter(pseudonym_normalized=value.lower()).exists():
            raise serializers.ValidationError(
                "This pseudonym is already taken"
            )
        
        return value.strip()
    
    def validate(self, attrs):
        """Cross-field validation."""
        if attrs.get('persistent') and not attrs.get('password'):
            raise serializers.ValidationError(
                "Password is required for persistent accounts"
            )
        
        return attrs
    
    def create(self, validated_data):
        """Create new user."""
        password = validated_data.pop('password', None)
        
        user = User.objects.create_user(
            pseudonym=validated_data['pseudonym'],
            persistent=validated_data.get('persistent', False)
        )
        
        if password:
            user.set_password(password)
        
        # Generate recovery token for persistent accounts
        recovery_token = None
        if validated_data.get('persistent'):
            recovery_token = secrets.token_urlsafe(32)
            user.set_recovery_token(recovery_token)
        
        user.save()
        
        # Include recovery token in response (shown only once)
        user._recovery_token = recovery_token
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    pseudonym = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=False)
    recovery_token = serializers.CharField(write_only=True, required=False)
    
    def validate(self, attrs):
        """Authenticate user."""
        pseudonym = attrs.get('pseudonym')
        password = attrs.get('password')
        recovery_token = attrs.get('recovery_token')
        
        if not (password or recovery_token):
            raise serializers.ValidationError(
                "Either password or recovery token is required"
            )
        
        try:
            user = User.objects.get(pseudonym_normalized=pseudonym.lower())
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")
        
        if user.is_banned:
            raise serializers.ValidationError("Account is banned")
        
        # Authenticate with password
        if password:
            if not user.check_password(password):
                raise serializers.ValidationError("Invalid credentials")
        
        # Authenticate with recovery token
        if recovery_token:
            if not user.check_recovery_token(recovery_token):
                raise serializers.ValidationError("Invalid recovery token")
        
        attrs['user'] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile (public view)."""
    
    class Meta:
        model = User
        fields = [
            'pseudonym',
            'created_at',
            'is_anonymous_user'
        ]
        read_only_fields = fields


class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer for user details (private view)."""
    
    # Add computed fields
    post_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'pseudonym',
            'persistent',
            'created_at',
            'last_login',
            'is_banned',
            'post_count',
            'comment_count'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'last_login',
            'is_banned',
            'post_count',
            'comment_count'
        ]
    
    def get_post_count(self, obj):
        """Get number of posts by user."""
        return obj.posts.filter(is_deleted=False).count()
    
    def get_comment_count(self, obj):
        """Get number of comments by user."""
        return obj.comments.filter(is_deleted=False).count()


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change."""
    
    old_password = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=True)
    recovery_token = serializers.CharField(write_only=True, required=False)
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
    
    def validate(self, attrs):
        """Validate password change request."""
        if not self.user:
            raise serializers.ValidationError("User context required")
        
        old_password = attrs.get('old_password')
        recovery_token = attrs.get('recovery_token')
        
        # For persistent accounts, require old password or recovery token
        if self.user.persistent:
            if not (old_password or recovery_token):
                raise serializers.ValidationError(
                    "Old password or recovery token required"
                )
            
            if old_password and not self.user.check_password(old_password):
                raise serializers.ValidationError("Invalid old password")
            
            if recovery_token and not self.user.check_recovery_token(recovery_token):
                raise serializers.ValidationError("Invalid recovery token")
        
        return attrs
    
    def save(self):
        """Change user password."""
        new_password = self.validated_data['new_password']
        self.user.set_password(new_password)
        self.user.persistent = True  # Upgrade to persistent account
        
        # Generate new recovery token
        recovery_token = secrets.token_urlsafe(32)
        self.user.set_recovery_token(recovery_token)
        self.user.save()
        
        return recovery_token
