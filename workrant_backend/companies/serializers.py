"""
Serializers for companies app.

SECURITY RULES:
- No sensitive company information exposed
- All company data is public and aggregated
- Proper validation of company names
"""

from rest_framework import serializers
from django.db.models import Avg, Count
from .models import Company, CompanyRating


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for company data."""
    
    # Add computed fields
    post_count = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()
    average_ratings = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id',
            'name',
            'slug',
            'industry',
            'created_at',
            'post_count',
            'rating_count',
            'average_ratings'
        ]
        read_only_fields = [
            'id',
            'slug',
            'created_at',
            'post_count',
            'rating_count',
            'average_ratings'
        ]
    
    def get_post_count(self, obj):
        """Get number of posts about this company."""
        return obj.posts.filter(is_deleted=False, is_hidden=False).count()
    
    def get_rating_count(self, obj):
        """Get number of ratings for this company."""
        return obj.ratings.count()
    
    def get_average_ratings(self, obj):
        """Get average ratings across all dimensions."""
        ratings = obj.ratings.aggregate(
            avg_fairness=Avg('fairness'),
            avg_work_life=Avg('work_life_balance'),
            avg_management_toxicity=Avg('management_toxicity')
        )
        
        # Round to 1 decimal place and handle None values
        return {
            'fairness': round(ratings['avg_fairness'] or 0, 1),
            'work_life_balance': round(ratings['avg_work_life'] or 0, 1),
            'management_toxicity': round(ratings['avg_management_toxicity'] or 0, 1)
        }


class CompanyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating companies."""
    
    class Meta:
        model = Company
        fields = ['name', 'industry']
    
    def validate_name(self, value):
        """Validate company name."""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError(
                "Company name must be at least 2 characters long"
            )
        
        # Basic sanitization
        name = value.strip()
        
        # Check for obvious test/spam names
        spam_patterns = ['test', 'fake', 'spam', 'xxx']
        if any(pattern in name.lower() for pattern in spam_patterns):
            raise serializers.ValidationError(
                "Invalid company name"
            )
        
        return name


class CompanyRatingSerializer(serializers.ModelSerializer):
    """Serializer for company ratings."""
    
    class Meta:
        model = CompanyRating
        fields = [
            'id',
            'company',
            'fairness',
            'work_life_balance',
            'management_toxicity',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate(self, attrs):
        """Validate rating values."""
        # Ensure all ratings are within 1-5 range
        for field in ['fairness', 'work_life_balance', 'management_toxicity']:
            value = attrs.get(field)
            if value is not None and (value < 1 or value > 5):
                raise serializers.ValidationError(
                    f"{field} must be between 1 and 5"
                )
        
        return attrs
    
    def create(self, validated_data):
        """Create or update rating (one per user per company)."""
        user = self.context['request'].user
        company = validated_data['company']
        
        # Update existing rating or create new one
        rating, created = CompanyRating.objects.update_or_create(
            user=user,
            company=company,
            defaults={
                'fairness': validated_data['fairness'],
                'work_life_balance': validated_data['work_life_balance'],
                'management_toxicity': validated_data['management_toxicity']
            }
        )
        
        return rating


class CompanyDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for company profile pages."""
    
    # Add comprehensive computed fields
    post_count = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()
    average_ratings = serializers.SerializerMethodField()
    rating_distribution = serializers.SerializerMethodField()
    recent_posts = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id',
            'name',
            'slug',
            'industry',
            'created_at',
            'post_count',
            'rating_count',
            'average_ratings',
            'rating_distribution',
            'recent_posts'
        ]
        read_only_fields = fields
    
    def get_post_count(self, obj):
        """Get number of visible posts."""
        return obj.posts.filter(is_deleted=False, is_hidden=False).count()
    
    def get_rating_count(self, obj):
        """Get total number of ratings."""
        return obj.ratings.count()
    
    def get_average_ratings(self, obj):
        """Get detailed average ratings."""
        ratings = obj.ratings.aggregate(
            avg_fairness=Avg('fairness'),
            avg_work_life=Avg('work_life_balance'),
            avg_management_toxicity=Avg('management_toxicity'),
            count=Count('id')
        )
        
        if ratings['count'] == 0:
            return None
        
        return {
            'fairness': round(ratings['avg_fairness'] or 0, 1),
            'work_life_balance': round(ratings['avg_work_life'] or 0, 1),
            'management_toxicity': round(ratings['avg_management_toxicity'] or 0, 1),
            'overall': round((
                (ratings['avg_fairness'] or 0) +
                (ratings['avg_work_life'] or 0) +
                (5 - (ratings['avg_management_toxicity'] or 0))  # Invert toxicity
            ) / 3, 1)
        }
    
    def get_rating_distribution(self, obj):
        """Get distribution of ratings (1-5 stars)."""
        distributions = {}
        
        for field in ['fairness', 'work_life_balance', 'management_toxicity']:
            distribution = {}
            for rating in range(1, 6):
                count = obj.ratings.filter(**{field: rating}).count()
                distribution[str(rating)] = count
            distributions[field] = distribution
        
        return distributions
    
    def get_recent_posts(self, obj):
        """Get recent post IDs (for preview)."""
        recent_posts = obj.posts.filter(
            is_deleted=False, 
            is_hidden=False
        ).order_by('-created_at')[:5]
        
        return [str(post.id) for post in recent_posts]


class CompanySearchSerializer(serializers.ModelSerializer):
    """Lightweight serializer for company search results."""
    
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id',
            'name',
            'slug',
            'industry',
            'post_count'
        ]
        read_only_fields = fields
    
    def get_post_count(self, obj):
        """Get number of visible posts - uses the model property."""
        return obj.post_count  # Uses the @property from the model

