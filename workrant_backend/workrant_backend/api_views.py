"""
Health check and API root views.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.utils import timezone
import django


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Simple health check endpoint.
    """
    return Response({
        'status': 'healthy',
        'service': 'WorkRant Backend API',
        'version': '1.0.0',
        'django_version': django.get_version(),
        'debug': settings.DEBUG,
        'timestamp': timezone.now().isoformat()
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    API root endpoint with available endpoints.
    """
    return Response({
        'message': 'Welcome to WorkRant API',
        'version': '1.0.0',
        'documentation': '/api/docs/',
        'endpoints': {
            'health': '/api/health/',
            'auth': {
                'register': '/api/auth/register/',
                'login': '/api/auth/login/',
                'profile': '/api/auth/profile/',
            },
            'posts': {
                'list': '/api/posts/',
                'create': '/api/posts/',
                'detail': '/api/posts/{id}/',
            },
            'companies': {
                'list': '/api/companies/',
                'create': '/api/companies/',
                'detail': '/api/companies/{slug}/',
            },
            'moderation': {
                'report': '/api/moderation/report/',
                'reports': '/api/moderation/reports/',
            }
        }
    }, status=status.HTTP_200_OK)
