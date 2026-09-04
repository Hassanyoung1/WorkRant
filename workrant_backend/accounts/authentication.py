"""Authentication rules shared by protected JWT views."""

from rest_framework.authentication import CSRFCheck
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication


def user_authentication_rule(user):
    """Reject inactive and application-banned accounts."""
    return user is not None and user.is_active and not user.is_banned


class CookieJWTAuthentication(JWTAuthentication):
    """Authenticate access tokens from the protected browser cookie."""

    def authenticate(self, request):
        if request.META.get('HTTP_AUTHORIZATION'):
            return super().authenticate(request)

        raw_token = request.COOKIES.get('access_token')
        if not raw_token:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
        except AuthenticationFailed:
            # Expired cookies must not block public login or registration.
            # Protected views still reject the anonymous request via permissions.
            return None

        csrf_check = CSRFCheck(lambda request: None)
        reason = csrf_check.process_view(request, None, (), {})
        if reason:
            raise AuthenticationFailed(f'CSRF validation failed: {reason}')

        return user, validated_token