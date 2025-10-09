"""
User models for WorkRant.

SECURITY RULES:
- No PII stored (emails, phone numbers, real names, IPs)
- Only pseudonyms and UUIDs for identification
- Recovery tokens must be hashed before storage
- All IDs are UUIDv4 for anonymity
"""

import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.contrib.auth.hashers import make_password, check_password
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom user manager for pseudonym-based authentication."""
    
    def get_by_natural_key(self, username):
        """Get user by pseudonym (natural key)."""
        return self.get(pseudonym=username)
    
    def create_user(self, pseudonym, password=None, **extra_fields):
        """Create and return a user with pseudonym."""
        if not pseudonym:
            raise ValueError('Users must have a pseudonym')
        
        user = self.model(
            pseudonym=pseudonym,
            **extra_fields
        )
        
        if password:
            user.set_password(password)
        
        user.save(using=self._db)
        return user
    
    def create_superuser(self, pseudonym, password=None, **extra_fields):
        """Create and return a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('persistent', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(pseudonym, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model for WorkRant.
    
    Stores only pseudonyms and essential auth data.
    NO PII (emails, phone numbers, real names) allowed.
    """
    
    # UUID primary key for anonymity
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )
    
    # Pseudonym for identification (required, unique)
    pseudonym = models.CharField(
        max_length=64, 
        unique=True,
        help_text="Anonymous pseudonym for the user"
    )
    
    # Normalized pseudonym for case-insensitive lookups
    pseudonym_normalized = models.CharField(
        max_length=64, 
        unique=True,
        editable=False,
        help_text="Lowercase version of pseudonym for lookups"
    )
    
    # Whether user opted for persistent account (with password)
    persistent = models.BooleanField(
        default=False,
        help_text="True if user has a password-protected account"
    )
    
    # Hashed recovery token (optional, shown once to user)
    recovery_token_hash = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="Hashed recovery token for account recovery"
    )
    
    # Account status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_banned = models.BooleanField(
        default=False,
        help_text="True if user is banned from posting"
    )
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'pseudonym'
    REQUIRED_FIELDS = []
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['pseudonym_normalized']),
            models.Index(fields=['created_at']),
        ]
    
    def save(self, *args, **kwargs):
        """Override save to ensure pseudonym_normalized is set."""
        if self.pseudonym:
            self.pseudonym_normalized = self.pseudonym.lower()
        super().save(*args, **kwargs)
    
    def set_recovery_token(self, token):
        """Set recovery token (hashed before storage)."""
        self.recovery_token_hash = make_password(token)
    
    def check_recovery_token(self, token):
        """Check if provided token matches stored hash."""
        if not self.recovery_token_hash:
            return False
        return check_password(token, self.recovery_token_hash)
    
    def __str__(self):
        return f"@{self.pseudonym}"
    
    def get_display_name(self):
        """Get display name (just the pseudonym)."""
        return self.pseudonym
    
    @property
    def is_anonymous_user(self):
        """True if user doesn't have password (anonymous)."""
        return not self.persistent
