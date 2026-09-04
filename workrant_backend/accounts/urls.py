"""
URL configuration for accounts app.
"""

from django.urls import re_path
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentication
    re_path(r'^register/?$', views.UserRegistrationView.as_view(), name='register'),
    re_path(r'^login/?$', views.UserLoginView.as_view(), name='login'),
    re_path(r'^refresh/?$', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    re_path(r'^logout/?$', views.UserLogoutView.as_view(), name='logout'),
    re_path(r'^profile/?$', views.UserProfileView.as_view(), name='profile'),
    re_path(r'^password/change/?$', views.PasswordChangeView.as_view(), name='password_change'),
    re_path(r'^delete/?$', views.user_delete_account, name='delete_account'),
    # User lookup
    re_path(r'^user/(?P<pseudonym>[^/]+)/?$', views.user_by_pseudonym, name='user_by_pseudonym'),
    re_path(r'^check-auth/?$', views.check_auth_status, name='check_auth'),
]
