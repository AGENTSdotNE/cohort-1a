from rest_framework import status
from rest_framework.test import APITestCase

from .factories import create_user

URL = '/api/auth/users/'


class UserListTests(APITestCase):
    def setUp(self):
        self.user = create_user()
        self.client.force_authenticate(self.user)

    def test_signed_out_gets_401(self):
        self.client.force_authenticate(None)

        response = self.client.get(URL)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_lists_every_user_ordered_by_email(self):
        create_user(email='zoe@example.com')
        create_user(email='alice@example.com')

        response = self.client.get(URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [row['email'] for row in response.data], ['alice@example.com', self.user.email, 'zoe@example.com']
        )

    def test_a_row_only_has_the_summary_fields(self):
        response = self.client.get(URL)

        self.assertEqual(set(response.data[0]), {'id', 'email', 'full_name'})

    def test_every_officer_sees_the_same_list(self):
        other = create_user(email='other@example.com')

        mine = self.client.get(URL).data

        self.client.force_authenticate(other)
        theirs = self.client.get(URL).data

        self.assertEqual(mine, theirs)
