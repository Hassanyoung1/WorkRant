"""
Views for companies app.

SECURITY RULES:
- All company data is public
- No sensitive company information exposed
- Proper validation of company creation
- Aggregated ratings only
"""

from rest_framework import status, permissions, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count
from django.contrib.postgres.search import SearchVector
from django.utils import timezone

from .models import Company, CompanyRating
from .serializers import (
    CompanySerializer,
    CompanyCreateSerializer,
    CompanyDetailSerializer,
    CompanySearchSerializer,
    CompanyRatingSerializer
)


class CompanyListView(generics.ListAPIView):
    """
    List companies with search and filtering.
    
    Supports search by name and filtering by industry.
    Public endpoint - no authentication required.
    """
    serializer_class = CompanySerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Company.objects.filter(is_suspect=False)
        
        # Search by name (simple case-insensitive search for SQLite compatibility)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ).order_by('name')  # Simple ordering for SQLite
        
        # Filter by industry
        industry = self.request.query_params.get('industry')
        if industry:
            queryset = queryset.filter(industry__icontains=industry)
        
        # Filter by minimum post count
        min_posts = self.request.query_params.get('min_posts')
        if min_posts:
            try:
                min_posts = int(min_posts)
                queryset = queryset.annotate(
                    post_count=Count('posts', filter=Q(
                        posts__is_deleted=False,
                        posts__is_hidden=False
                    ))
                ).filter(post_count__gte=min_posts)
            except ValueError:
                pass
        
        # Default ordering
        if not search:
            queryset = queryset.order_by('-created_at')
        
        return queryset


class CompanyDetailView(generics.RetrieveAPIView):
    """
    Company detail view with comprehensive information.
    
    Includes posts, ratings, and aggregated statistics.
    Public endpoint - no authentication required.
    """
    serializer_class = CompanyDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        return Company.objects.filter(is_suspect=False)


class CompanyCreateView(APIView):
    """
    Create new company.
    
    Auto-creates companies when mentioned in posts.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = CompanyCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            # Check if company already exists
            name = serializer.validated_data['name']
            existing_company = Company.objects.filter(name__iexact=name).first()
            
            if existing_company:
                return Response(
                    CompanySerializer(existing_company).data,
                    status=status.HTTP_200_OK
                )
            
            # Create new company
            company = serializer.save()
            return Response(
                CompanySerializer(company).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CompanyRatingView(APIView):
    """
    Create or update company rating.
    
    One rating per user per company.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, company_id):
        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response(
                {'error': 'Company not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Add company to request data
        data = request.data.copy()
        data['company'] = company.id
        
        serializer = CompanyRatingSerializer(
            data=data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            rating = serializer.save()
            return Response(
                CompanyRatingSerializer(rating).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request, company_id):
        """Get user's existing rating for the company."""
        try:
            company = Company.objects.get(id=company_id)
            rating = CompanyRating.objects.get(
                company=company,
                user=request.user
            )
            return Response(CompanyRatingSerializer(rating).data)
        except (Company.DoesNotExist, CompanyRating.DoesNotExist):
            return Response(
                {'error': 'Rating not found'},
                status=status.HTTP_404_NOT_FOUND
            )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])  # Allow anyone to search companies
def company_search(request):
    """
    Search companies by name.
    
    Returns lightweight search results.
    Open to all users to facilitate post creation.
    """
    query = request.GET.get('q', '').strip()
    
    if not query or len(query) < 2:
        return Response(
            {'error': 'Search query must be at least 2 characters'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Search companies - exclude suspect companies
    companies = Company.objects.filter(
        name__icontains=query,
        is_suspect=False
    ).order_by('name')[:20]  # Limit to top 20 results
    
    serializer = CompanySearchSerializer(companies, many=True)
    return Response({
        'query': query,
        'results': serializer.data,
        'count': len(serializer.data)
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def company_stats(request, company_id):
    """
    Get detailed company statistics.
    
    Returns comprehensive stats for company profile.
    Requires authentication to access company stats.
    """
    try:
        company = Company.objects.get(id=company_id)
    except Company.DoesNotExist:
        return Response(
            {'error': 'Company not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Calculate stats
    stats = {
        'total_posts': company.posts.filter(
            is_deleted=False,
            is_hidden=False
        ).count(),
        
        'total_ratings': company.ratings.count(),
        
        'posts_this_month': company.posts.filter(
            is_deleted=False,
            is_hidden=False,
            created_at__month=timezone.now().month,
            created_at__year=timezone.now().year
        ).count(),
        
        'average_ratings': company.average_ratings if hasattr(company, 'average_ratings') else None,
        
        'tags_distribution': {},  # TODO: Implement tag counting
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def trending_companies(request):
    """
    Get trending companies based on recent activity.
    
    Returns companies with most recent posts/ratings.
    Requires authentication to access trending companies.
    """
    from django.utils import timezone
    from datetime import timedelta
    
    # Get companies with activity in the last 30 days
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    trending = Company.objects.filter(
        is_suspect=False
    ).annotate(
        recent_posts=Count('posts', filter=Q(
            posts__created_at__gte=thirty_days_ago,
            posts__is_deleted=False,
            posts__is_hidden=False
        )),
        recent_ratings=Count('ratings', filter=Q(
            ratings__created_at__gte=thirty_days_ago
        ))
    ).filter(
        Q(recent_posts__gt=0) | Q(recent_ratings__gt=0)
    ).order_by('-recent_posts', '-recent_ratings')[:10]
    
    serializer = CompanySerializer(trending, many=True)
    return Response({
        'trending_companies': serializer.data,
        'period': '30 days'
    })
