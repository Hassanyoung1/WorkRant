"""
Company models for WorkRant.

SECURITY RULES:
- Companies are identified by name and slug
- No sensitive company information stored
- All IDs are UUIDs for consistency
"""

import uuid
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Company(models.Model):
    """
    Company model for WorkRant.
    
    Represents companies that users can post about.
    Auto-created when mentioned in posts.
    """
    
    # UUID primary key for consistency
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )
    
    # Company name (as entered by users)
    name = models.TextField(
        help_text="Company name as entered by users"
    )
    
    # URL-friendly slug
    slug = models.SlugField(
        max_length=200,
        unique=True,
        help_text="URL-friendly version of company name"
    )
    
    # Optional industry classification
    industry = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Industry sector (optional)"
    )
    
    # Moderation flags
    is_suspect = models.BooleanField(
        default=False,
        help_text="True if company is flagged for suspicious activity"
    )
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'companies'
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['name']),
            models.Index(fields=['created_at']),
        ]
    
    def save(self, *args, **kwargs):
        """Override save to generate slug from name."""
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            
            # Ensure unique slug
            while Company.objects.filter(slug=slug).exclude(id=self.id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            self.slug = slug
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name
    
    @property
    def post_count(self):
        """Get number of posts about this company."""
        return self.posts.count()
    
    @property
    def average_rating(self):
        """Get average rating across all dimensions."""
        from .aggregates import get_company_ratings
        ratings = get_company_ratings(self.id)
        if not ratings:
            return None
        
        total = (
            ratings.get('avg_fairness', 0) +
            ratings.get('avg_work_life', 0) +
            ratings.get('avg_management_toxicity', 0)
        )
        return total / 3 if total > 0 else None


class CompanyRating(models.Model):
    """
    User ratings for companies across different dimensions.
    
    Users can rate companies on fairness, work-life balance, and management toxicity.
    One rating per user per company.
    """
    
    # UUID primary key
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )
    
    # References
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='ratings'
    )
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='company_ratings'
    )
    
    # Rating dimensions (1-5 scale)
    fairness = models.SmallIntegerField(
        help_text="Fairness rating (1-5)",
        choices=[(i, i) for i in range(1, 6)]
    )
    
    work_life_balance = models.SmallIntegerField(
        help_text="Work-life balance rating (1-5)",
        choices=[(i, i) for i in range(1, 6)]
    )
    
    management_toxicity = models.SmallIntegerField(
        help_text="Management toxicity rating (1-5, higher = more toxic)",
        choices=[(i, i) for i in range(1, 6)]
    )
    
    # Timestamp
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'company_ratings'
        verbose_name = 'Company Rating'
        verbose_name_plural = 'Company Ratings'
        unique_together = ['company', 'user']
        indexes = [
            models.Index(fields=['company', 'created_at']),
        ]
    
    def __str__(self):
        return f"Rating for {self.company.name} by @{self.user.pseudonym if self.user else 'deleted'}"
    
    @property
    def average_score(self):
        """Calculate average score across all dimensions."""
        return (self.fairness + self.work_life_balance + self.management_toxicity) / 3
