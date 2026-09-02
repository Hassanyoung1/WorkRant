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

    def test_refresh_accepts_json_body_token(self):
        login_response = self.client.post(
            reverse('accounts:login'),
            {'pseudonym': 'refreshuser', 'password': 'StrongPass123!'},
            format='json',
        )

        self.assertEqual(login_response.status_code, 200, login_response.content)
        refresh_token = login_response.json()['tokens']['refresh']

        response = self.client.post(
            reverse('accounts:token_refresh'),
            {'refresh': refresh_token},
            format='json',
        )

        self.assertEqual(response.status_code, 200, response.content)
        self.assertIn('message', response.json())

    def test_root_route_redirects_to_api(self):
        response = self.client.get('/')

        self.assertEqual(response.status_code, 200)
        self.assertIn('Welcome to WorkRant API', response.content.decode())

        head_response = self.client.head('/')

        self.assertEqual(head_response.status_code, 200)
