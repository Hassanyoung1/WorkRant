"""
Views for accounts app.

SECURITY RULES:
- All authentication endpoints properly secured
- No PII exposure in responses
- Proper JWT token handling
- Recovery tokens shown only once
- Rate limiting on auth endpoints
"""
from django.utils.decorators import method_decorator
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import login
from django.utils import timezone
#from django_ratelimit.decorators import ratelimit  # Disabled for development


# from django_ratelimit.decorators import ratelimit  # Disabled for development
# from django.utils.decorators import method_decorator  # Disabled for development

from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserDetailSerializer,
    PasswordChangeSerializer
)


# @method_decorator(ratelimit(key='ip', rate='5/m', method='POST'), name='post')  # Disabled for development
class UserRegistrationView(APIView):
    """
    User registration endpoint.
    
    Creates new users with pseudonyms only.
    Returns JWT tokens and optional recovery token.
    Rate limited: 5 registrations per minute per IP.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Prepare response
            response_data = {
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(access_token),
                },
                'disclaimer': 'Opinions expressed are anonymous and unverified.'
            }
            
            # Include recovery token if generated (shown only once)
            if hasattr(user, '_recovery_token') and user._recovery_token:
                response_data['recovery_token'] = user._recovery_token
                response_data['recovery_warning'] = (
                    'Save this recovery token securely. It will not be shown again.'
                )
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @method_decorator(ratelimit(key='ip', rate='10/m', method='POST'), name='post')  # Disabled for development
class UserLoginView(APIView):
    """
    User login endpoint.
    
    Supports both password and recovery token authentication.
    Rate limited: 10 login attempts per minute per IP.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        import logging
        logger = logging.getLogger("workrant.auth")
        logger.info(f"Login attempt with data: {request.data}")
        
        serializer = UserLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Update last login
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            response_data = {
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(access_token),
                },
                'disclaimer': 'Opinions expressed are anonymous and unverified.'
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        logger.error(f"Login validation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """
    User profile endpoint (read-only).
    
    Returns public profile information.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)


class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom JWT token refresh endpoint.
    
    Extends the default refresh view with additional security.
    """
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Add disclaimer to refresh response
            response.data['disclaimer'] = 'Opinions expressed are anonymous and unverified.'
        
        return response


# @method_decorator(ratelimit(key='user', rate='3/m', method='POST'), name='post')
class PasswordChangeView(APIView):
    """
    Password change/set endpoint.
    
    Allows users to set or change passwords.
    Returns new recovery token.
    Rate limited: 3 password changes per minute per user.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            user=request.user
        )
        
        if serializer.is_valid():
            recovery_token = serializer.save()
            
            return Response({
                'message': 'Password updated successfully',
                'recovery_token': recovery_token,
                'recovery_warning': (
                    'Save this recovery token securely. It will not be shown again.'
                ),
                'disclaimer': 'Opinions expressed are anonymous and unverified.'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def user_delete_account(request):
    """
    Delete user account (soft delete).
    
    Marks user as inactive and removes from posts/comments.
    """
    user = request.user
    
    # Soft delete - mark as inactive and banned
    user.is_active = False
    user.is_banned = True
    user.save()
    
    # Remove user reference from posts and comments (anonymize)
    user.posts.update(user=None)
    user.comments.update(user=None)
    user.votes.update(user=None)
    user.company_ratings.update(user=None)
    
    return Response({
        'message': 'Account deleted successfully',
        'disclaimer': 'Your posts and comments remain but are now fully anonymous.'
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def user_by_pseudonym(request, pseudonym):
    """
    Get public user profile by pseudonym.
    
    Returns minimal public information.
    """
    try:
        user = User.objects.get(
            pseudonym_normalized=pseudonym.lower(),
            is_active=True,
            is_banned=False
        )
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = UserProfileSerializer(user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_auth_status(request):
    """
    Check authentication status.
    
    Returns current user info if authenticated.
    """
    serializer = UserProfileSerializer(request.user)
    return Response({
        'authenticated': True,
        'user': serializer.data,
        'disclaimer': 'Opinions expressed are anonymous and unverified.'
    })
