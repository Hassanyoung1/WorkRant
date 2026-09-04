from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import User


class TokenRefreshAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            pseudonym='refreshuser',
            password='StrongPass123!',
            persistent=True,
        )

    def test_refresh_uses_http_only_cookie(self):
        login_response = self.client.post(
            reverse('accounts:login'),
            {'pseudonym': 'refreshuser', 'password': 'StrongPass123!'},
            format='json',
        )

        self.assertEqual(login_response.status_code, 200, login_response.content)
        self.assertNotIn('tokens', login_response.json())
        self.assertIn('refresh_token', login_response.cookies)

        response = self.client.post(
            reverse('accounts:token_refresh'),
        )

        self.assertEqual(response.status_code, 200, response.content)
        self.assertIn('message', response.json())

    def test_root_route_redirects_to_api(self):
        response = self.client.get('/')

        self.assertEqual(response.status_code, 200)
        self.assertIn('Welcome to WorkRant API', response.content.decode())

        head_response = self.client.head('/')

        self.assertEqual(head_response.status_code, 200)

    def test_logout_clears_auth_cookies(self):
        self.client.post(
            reverse('accounts:login'),
            {'pseudonym': 'refreshuser', 'password': 'StrongPass123!'},
            format='json',
        )

        response = self.client.post(reverse('accounts:logout'))

        self.assertEqual(response.status_code, 204)
        self.assertEqual(response.cookies['access_token']['max-age'], 0)
        self.assertEqual(response.cookies['refresh_token']['max-age'], 0)

    def test_expired_access_cookie_does_not_block_registration(self):
        self.client.cookies['access_token'] = 'expired.invalid.cookie'

        response = self.client.post(
            reverse('accounts:register'),
            {
                'pseudonym': 'new-registration-user',
                'password': 'StrongPass123!',
                'persistent': True,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201, response.content)
