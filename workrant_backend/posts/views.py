"""
Views for posts app.

SECURITY RULES:
- All content filtered for PII before saving
- No user IDs exposed in responses
- Proper anonymization for deleted users
- Content disclaimers enforced
"""

from rest_framework import status, permissions, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count, F
from django.contrib.postgres.search import SearchVector

from .models import Post, Comment, Vote
from .serializers import (
    PostSerializer,
    PostCreateSerializer,
    PostDetailSerializer,
    CommentSerializer,
    CommentCreateSerializer,
    VoteSerializer
)


class PostListView(generics.ListAPIView):
    """
    List posts with filtering and search.
    
    Supports filtering by company, tags, and search.
    Public endpoint - no authentication required to browse posts.
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated users to view posts
    
    def get_queryset(self):
        queryset = Post.objects.filter(
            is_deleted=False,
            is_hidden=False
        ).select_related('company', 'user').prefetch_related('votes')
        
        # Filter by company
        company_id = self.request.query_params.get('company')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        
        # Filter by current user (for profile page)
        user_filter = self.request.query_params.get('user')
        if user_filter == 'current' and self.request.user.is_authenticated:
            queryset = queryset.filter(user=self.request.user)
        
        # Filter by tags
        tags = self.request.query_params.get('tags')
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            queryset = queryset.filter(tags__overlap=tag_list)
        
        # Search in content
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.annotate(
                search_rank=SearchVector('title', 'body')
            ).filter(
                Q(title__icontains=search) |
                Q(body__icontains=search)
            )
        
        # Ordering
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering == 'trending':
            # Order by vote score and recent activity
            queryset = queryset.annotate(
                vote_score=Count('votes', filter=Q(votes__vote=1)) - 
                           Count('votes', filter=Q(votes__vote=-1))
            ).order_by('-vote_score', '-created_at')
        elif ordering == 'top':
            # Order by highest score
            queryset = queryset.order_by('-score', '-created_at')
        else:
            # Default: newest first
            queryset = queryset.order_by('-created_at')
        
        return queryset


class PostCreateView(APIView):
    """
    Create new post.
    
    Content is filtered for PII before saving.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Check if user is banned
        if request.user.is_banned:
            return Response(
                {'error': 'Account is banned from posting'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = PostCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            post = serializer.save()
            
            # Return created post with disclaimer
            response_serializer = PostDetailSerializer(
                post,
                context={'request': request}
            )
            
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostDetailView(generics.RetrieveAPIView):
    """
    Get single post with comments.
    
    Includes all visible comments and voting information.
    Public endpoint - no authentication required to view posts.
    """
    serializer_class = PostDetailSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated users to view post details
    
    def get_queryset(self):
        return Post.objects.filter(
            is_deleted=False,
            is_hidden=False
        ).select_related('company', 'user').prefetch_related('votes', 'comments')


class PostVoteView(APIView):
    """
    Vote on posts.
    
    Users can upvote (1) or downvote (-1) posts.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, post_id):
        try:
            post = Post.objects.get(
                id=post_id,
                is_deleted=False,
                is_hidden=False
            )
        except Post.DoesNotExist:
            return Response(
                {'error': 'Post not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = VoteSerializer(
            data=request.data,
            context={'request': request, 'post_id': post_id}
        )
        
        if serializer.is_valid():
            vote = serializer.save()
            
            # Update post score (simplified calculation)
            post.score = (
                post.votes.filter(vote=1).count() - 
                post.votes.filter(vote=-1).count()
            )
            post.save(update_fields=['score'])
            
            return Response({
                'vote': vote.vote,
                'post_score': post.score,
                'message': 'Vote recorded successfully'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, post_id):
        """Remove user's vote from post."""
        try:
            vote = Vote.objects.get(
                user=request.user,
                post_id=post_id
            )
            vote.delete()
            
            # Update post score
            post = Post.objects.get(id=post_id)
            post.score = (
                post.votes.filter(vote=1).count() - 
                post.votes.filter(vote=-1).count()
            )
            post.save(update_fields=['score'])
            
            return Response({
                'message': 'Vote removed successfully',
                'post_score': post.score
            })
            
        except Vote.DoesNotExist:
            return Response(
                {'error': 'Vote not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class CommentListCreateView(APIView):
    """
    List and create comments for a post.
    
    Comments are filtered for PII before saving.
    Viewing comments is public, creating requires authentication.
    """
    
    def get_permissions(self):
        """
        Allow anyone to view comments, but require auth to create.
        """
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get(self, request, post_id):
        """Get comments for a post. Public endpoint."""
        try:
            post = Post.objects.get(
                id=post_id,
                is_deleted=False,
                is_hidden=False
            )
        except Post.DoesNotExist:
            return Response(
                {'error': 'Post not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        comments = Comment.objects.filter(
            post=post,
            is_deleted=False,
            is_hidden=False
        ).select_related('user').order_by('created_at')
        
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    def post(self, request, post_id):
        """Create new comment."""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if request.user.is_banned:
            return Response(
                {'error': 'Account is banned from commenting'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            post = Post.objects.get(
                id=post_id,
                is_deleted=False,
                is_hidden=False
            )
        except Post.DoesNotExist:
            return Response(
                {'error': 'Post not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = CommentCreateSerializer(
            data=request.data,
            context={'request': request, 'post_id': post_id}
        )
        
        if serializer.is_valid():
            comment = serializer.save()
            response_serializer = CommentSerializer(comment)
            
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_post(request, post_id):
    """
    Soft delete a post (user's own posts only).
    
    Only post authors can delete their posts.
    """
    try:
        post = Post.objects.get(
            id=post_id,
            user=request.user,
            is_deleted=False
        )
    except Post.DoesNotExist:
        return Response(
            {'error': 'Post not found or not authorized'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Soft delete
    post.is_deleted = True
    post.save()
    
    return Response({
        'message': 'Post deleted successfully'
    })


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_comment(request, comment_id):
    """
    Soft delete a comment (user's own comments only).
    
    Only comment authors can delete their comments.
    """
    try:
        comment = Comment.objects.get(
            id=comment_id,
            user=request.user,
            is_deleted=False
        )
    except Comment.DoesNotExist:
        return Response(
            {'error': 'Comment not found or not authorized'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Soft delete
    comment.is_deleted = True
    comment.save()
    
    return Response({
        'message': 'Comment deleted successfully'
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def trending_posts(request):
    """
    Get trending posts based on recent votes and activity.
    
    Returns posts with highest engagement in recent period.
    Requires authentication to access trending posts.
    """
    from django.utils import timezone
    from datetime import timedelta
    
    # Get posts with recent activity
    seven_days_ago = timezone.now() - timedelta(days=7)
    
    trending = Post.objects.filter(
        is_deleted=False,
        is_hidden=False,
        created_at__gte=seven_days_ago
    ).annotate(
        vote_score=Count('votes', filter=Q(votes__vote=1)) - 
                   Count('votes', filter=Q(votes__vote=-1)),
        comment_count=Count('comments', filter=Q(
            comments__is_deleted=False,
            comments__is_hidden=False
        ))
    ).order_by('-vote_score', '-comment_count', '-created_at')[:20]
    
    serializer = PostSerializer(
        trending,
        many=True,
        context={'request': request}
    )
    
    return Response({
        'trending_posts': serializer.data,
        'period': '7 days'
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_posts(request):
    """
    Get current user's posts.
    
    Returns user's own posts including deleted ones.
    """
    posts = Post.objects.filter(
        user=request.user
    ).select_related('company').order_by('-created_at')
    
    serializer = PostSerializer(
        posts,
        many=True,
        context={'request': request}
    )
    
    return Response(serializer.data)
