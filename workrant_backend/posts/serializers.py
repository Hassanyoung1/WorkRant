"""
Serializers for posts app.

SECURITY RULES:
- All content must be filtered for PII before saving
- No user IDs exposed, only pseudonyms
- Proper content validation and sanitization
- Disclaimer injection for all post content
"""

import re
from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import Post, Comment, Vote
from companies.models import Company
from companies.serializers import CompanySerializer


def validate_content_for_pii(content):
    """
    Enhanced PII validation for content.
    
    This should be the primary defense against PII leakage.
    """
    if not content:
        return content
    
    # Email pattern
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'
    if re.search(email_pattern, content, re.IGNORECASE):
        raise serializers.ValidationError(
            'Content contains email address. Please remove personal information.'
        )
    
    # Nigerian phone number patterns
    phone_patterns = [
        r'\b(?:0|\+?234)[0-9]{10,}\b',  # Nigerian numbers
        r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # General phone pattern
    ]
    
    for pattern in phone_patterns:
        if re.search(pattern, content):
            raise serializers.ValidationError(
                'Content contains phone number. Please remove personal information.'
            )
    
    # NIN pattern (11 digits)
    nin_pattern = r'\b\d{11}\b'
    if re.search(nin_pattern, content):
        raise serializers.ValidationError(
            'Content may contain sensitive numbers. Please remove personal information.'
        )
    
    # Address patterns (basic detection)
    address_patterns = [
        r'\b\d+\s+[A-Za-z\s]+(?:street|road|avenue|drive|lane|st|rd|ave|dr|ln)\b',
        r'\b(?:apt|apartment|unit|suite)\s*\d+\b'
    ]
    
    for pattern in address_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            raise serializers.ValidationError(
                'Content may contain address information. Please remove personal details.'
            )
    
    return content


class PostSerializer(serializers.ModelSerializer):
    """Serializer for post display."""
    
    # Related data
    company = CompanySerializer(read_only=True)
    author_pseudonym = serializers.CharField(source='user.pseudonym', read_only=True)
    
    # Computed fields
    vote_count = serializers.SerializerMethodField()
    upvotes = serializers.SerializerMethodField()
    downvotes = serializers.SerializerMethodField()
    vote_score = serializers.IntegerField(source='score', read_only=True)
    comment_count = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()
    content_with_disclaimer = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'body',
            'content_with_disclaimer',
            'media_urls',
            'tags',
            'company',
            'author_pseudonym',
            'score',
            'vote_score',
            'vote_count',
            'upvotes',
            'downvotes',
            'comment_count',
            'user_vote',
            'created_at',
            'updated_at'
        ]
        read_only_fields = fields
    
    def get_vote_count(self, obj):
        """Get net vote count."""
        upvotes = obj.votes.filter(vote=1).count()
        downvotes = obj.votes.filter(vote=-1).count()
        return upvotes - downvotes
    
    def get_upvotes(self, obj):
        """Get upvote count."""
        return obj.votes.filter(vote=1).count()
    
    def get_downvotes(self, obj):
        """Get downvote count."""
        return obj.votes.filter(vote=-1).count()
    
    def get_comment_count(self, obj):
        """Get number of visible comments."""
        return obj.comments.filter(is_deleted=False, is_hidden=False).count()
    
    def get_user_vote(self, obj):
        """Get current user's vote on this post."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        try:
            vote = obj.votes.get(user=request.user)
            return 'upvote' if vote.vote == 1 else 'downvote'
        except Vote.DoesNotExist:
            return None
    
    def get_content_with_disclaimer(self, obj):
        """Get post content with disclaimer."""
        disclaimer = "\n\n---\n📢 Opinions expressed are anonymous and unverified."
        return obj.body + disclaimer


class PostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating posts."""
    
    company_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    content = serializers.CharField(write_only=True)
    post_type = serializers.CharField(write_only=True, required=False, default='experience')
    tags = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Post
        fields = [
            'content',
            'post_type', 
            'company_name',
            'tags',
            'image'
        ]
    
    def validate_content(self, value):
        """Validate post content for PII."""
        return validate_content_for_pii(value)
    
    def validate_media_urls(self, value):
        """Validate media URLs."""
        if not value:
            return []
        
        if len(value) > 5:
            raise serializers.ValidationError(
                'Maximum 5 media files allowed per post'
            )
        
        # Basic URL validation
        for url in value:
            if not isinstance(url, str) or not url.startswith(('http://', 'https://')):
                raise serializers.ValidationError(
                    'Invalid media URL format'
                )
        
        return value
    
    def validate_tags(self, value):
        """Validate tags and ensure proper format."""
        import json
        
        # Handle tags sent as JSON string from FormData
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                # If it's not valid JSON, treat as single tag
                value = [value]
        
        if not isinstance(value, list):
            raise serializers.ValidationError('Tags must be a list')
        
        # Clean and validate tags
        clean_tags = []
        for tag in value:
            if isinstance(tag, str):
                tag = tag.strip().lower()
                if tag and len(tag) <= 50:
                    if not tag.startswith('#'):
                        tag = '#' + tag
                    clean_tags.append(tag)
        
        return clean_tags
    
    def validate_company_name(self, value):
        """Validate company name."""
        if value and len(value.strip()) < 2:
            raise serializers.ValidationError(
                'Company name must be at least 2 characters'
            )
        
        return value.strip() if value else None
    
    def create(self, validated_data):
        """Create post with company association and image upload."""
        company_name = validated_data.pop('company_name', None)
        content = validated_data.pop('content')
        post_type = validated_data.pop('post_type', 'experience')
        tags = validated_data.pop('tags', [])
        image = validated_data.pop('image', None)
        user = self.context['request'].user
        
        # Clean and prepare tags
        clean_tags = []
        if tags:
            for tag in tags:
                if isinstance(tag, str):
                    tag = tag.strip().lower()
                    if tag:
                        # Add # prefix if not present
                        if not tag.startswith('#'):
                            tag = '#' + tag
                        clean_tags.append(tag)
        
        # Add post_type as a tag
        if post_type and f'#{post_type}' not in clean_tags:
            clean_tags.append(f'#{post_type}')
        
        # Handle image upload
        import logging
        media_urls = []
        if image:
            from django.core.files.storage import default_storage
            import os
            from django.utils import timezone
            logger = logging.getLogger("workrant.upload")
            try:
                # Ensure file pointer is at start
                if hasattr(image, 'seek'):
                    image.seek(0)
                # Create uploads directory if it doesn't exist
                upload_dir = 'post_media'
                os.makedirs(os.path.join('media', upload_dir), exist_ok=True)
                # Generate unique filename
                timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{upload_dir}/{user.id}_{timestamp}_{image.name}"
                # Save the file
                saved_path = default_storage.save(filename, image)
                logger.info(f"Image saved to: {saved_path}")
                # Build the full URL
                request = self.context.get('request')
                if request:
                    media_url = request.build_absolute_uri(default_storage.url(saved_path))
                    logger.info(f"Image URL: {media_url}")
                    media_urls.append(media_url)
            except Exception as e:
                logger.error(f"Image upload failed: {e}")
        
        # Map frontend fields to backend model fields
        post_data = {
            'body': content,  # Map content -> body
            'tags': clean_tags,
            'media_urls': media_urls,
            'user': user,
        }
        
        # Get or create company if provided
        if company_name:
            company, created = Company.objects.get_or_create(
                name=company_name,
                defaults={'industry': 'Other'}  # Set default industry instead of None
            )
            post_data['company'] = company
        
        # Create post
        post = Post.objects.create(**post_data)
        
        return post


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for comment display."""
    
    author_pseudonym = serializers.CharField(source='user.pseudonym', read_only=True)
    content_with_disclaimer = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id',
            'body',
            'content_with_disclaimer',
            'author_pseudonym',
            'parent',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'author_pseudonym',
            'content_with_disclaimer',
            'created_at'
        ]
    
    def get_content_with_disclaimer(self, obj):
        """Get comment content with disclaimer."""
        disclaimer = "\n\n---\n📢 Opinions expressed are anonymous and unverified."
        return obj.body + disclaimer


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments."""
    
    class Meta:
        model = Comment
        fields = ['body', 'parent']
    
    def validate_body(self, value):
        """Validate comment content for PII."""
        return validate_content_for_pii(value)
    
    def validate_parent(self, value):
        """Validate parent comment."""
        if value:
            # Ensure parent belongs to the same post
            post_id = self.context.get('post_id')
            if value.post_id != post_id:
                raise serializers.ValidationError(
                    'Parent comment must belong to the same post'
                )
        
        return value
    
    def create(self, validated_data):
        """Create comment."""
        user = self.context['request'].user
        post_id = self.context['post_id']
        
        comment = Comment.objects.create(
            user=user,
            post_id=post_id,
            **validated_data
        )
        
        return comment


class VoteSerializer(serializers.ModelSerializer):
    """Serializer for voting."""
    
    class Meta:
        model = Vote
        fields = ['vote']
    
    def validate_vote(self, value):
        """Validate vote value."""
        if value not in [1, -1]:
            raise serializers.ValidationError(
                'Vote must be 1 (upvote) or -1 (downvote)'
            )
        return value
    
    def create(self, validated_data):
        """Create or update vote."""
        user = self.context['request'].user
        post_id = self.context['post_id']
        
        vote, created = Vote.objects.update_or_create(
            user=user,
            post_id=post_id,
            defaults={'vote': validated_data['vote']}
        )
        
        return vote


class PostDetailSerializer(PostSerializer):
    """Detailed serializer for single post view."""
    
    comments = serializers.SerializerMethodField()
    
    class Meta(PostSerializer.Meta):
        fields = PostSerializer.Meta.fields + ['comments']
    
    def get_comments(self, obj):
        """Get visible comments for the post."""
        comments = obj.comments.filter(
            is_deleted=False,
            is_hidden=False
        ).order_by('created_at')
        
        return CommentSerializer(comments, many=True, context=self.context).data
