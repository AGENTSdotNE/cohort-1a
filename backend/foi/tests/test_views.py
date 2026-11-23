from datetime import date, timedelta

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.tests.factories import create_user
from inbound.models import InboundItem

from ..models import Department, FOICase

URL = '/api/foi/'


def create_case(**overrides):
    item = InboundItem.objects.create(
        reference=overrides.pop('reference', 'EM-1'),
        channel='email',
        subject='Freedom of Information request',
        message='Please provide the total spent on consultants.',
    )
    case = item.foi_case

    for field, value in overrides.items():
        setattr(case, field, value)

    case.save()

    return case


class FOICaseListTests(APITestCase):
    def setUp(self):
        self.user = create_user()
        self.client.force_authenticate(self.user)

    def test_signed_out_gets_401(self):
        self.client.force_authenticate(None)

        response = self.client.get(URL)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_every_officer_sees_the_same_cases(self):
        create_case()
        mine = self.client.get(URL).data

        self.client.force_authenticate(create_user(email='other@example.com'))
        theirs = self.client.get(URL).data

        self.assertEqual(len(mine), 1)
        self.assertEqual(mine, theirs)

    def test_a_case_includes_the_inbound_item_and_its_actions(self):
        create_case()

        row = self.client.get(URL).data[0]

        self.assertEqual(row['item']['reference'], 'EM-1')
        self.assertEqual(row['status'], FOICase.Status.POSSIBLE)
        self.assertIn('Mentions FOI or the Act', row['reasons'])
        self.assertEqual(row['actions'], [])

    def test_can_filter_by_status(self):
        create_case(reference='EM-1')
        create_case(reference='EM-2', status=FOICase.Status.NOT_FOI, department=Department.WASTE)

        response = self.client.get(URL, {'status': 'not_foi'})

        self.assertEqual([row['item']['reference'] for row in response.data], ['EM-2'])

    def test_overdue_is_true_once_the_deadline_has_passed(self):
        case = create_case(deadline=date.today() - timedelta(days=1))

        response = self.client.get(f'{URL}{case.id}/')

        self.assertTrue(response.data['is_overdue'])

    def test_a_responded_case_past_deadline_is_still_overdue_until_closed(self):
        # Intentional: "responded" doesn't clear overdue by itself, only "closed" does.
        case = create_case(deadline=date.today() - timedelta(days=1), status=FOICase.Status.RESPONDED)

        response = self.client.get(f'{URL}{case.id}/')

        self.assertTrue(response.data['is_overdue'])

    def test_a_closed_case_is_never_overdue(self):
        create_case(deadline=date.today() - timedelta(days=1), status=FOICase.Status.CLOSED)

        response = self.client.get(URL)

        self.assertFalse(response.data[0]['is_overdue'])

    def test_the_list_is_every_item_not_just_flagged_ones(self):
        InboundItem.objects.create(reference='PH-1', channel='phone', subject='Bins', message='When is my bin?')

        row = self.client.get(URL).data[0]

        self.assertEqual(row['status'], FOICase.Status.NOT_FOI)
        self.assertEqual(row['confidence'], FOICase.Confidence.NOT_FLAGGED)


class NoManualCreateTests(APITestCase):
    """Every item gets a case automatically (see flagging.auto_flag), so there's nothing to create."""

    def setUp(self):
        self.user = create_user()
        self.client.force_authenticate(self.user)

    def test_post_to_the_list_is_not_allowed(self):
        item = InboundItem.objects.create(reference='PH-1', channel='phone', subject='Bins', message='When is my bin?')

        response = self.client.post(URL, {'item': item.id}, format='json')

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class OwnerAssignmentTests(APITestCase):
    def setUp(self):
        self.user = create_user()
        self.client.force_authenticate(self.user)

    def test_assigning_an_owner(self):
        case = create_case()
        owner = create_user(email='owner@example.com')

        response = self.client.patch(f'{URL}{case.id}/', {'owner': owner.id}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['owner'], owner.email)

    def test_unassigning_an_owner(self):
        owner = create_user(email='owner@example.com')
        case = create_case(owner=owner)

        response = self.client.patch(f'{URL}{case.id}/', {'owner': None}, format='json')

        self.assertIsNone(response.data['owner'])

    def test_patch_cannot_change_other_fields(self):
        case = create_case()

        self.client.patch(f'{URL}{case.id}/', {'status': FOICase.Status.CLOSED}, format='json')

        case.refresh_from_db()
        self.assertEqual(case.status, FOICase.Status.POSSIBLE)


class DecideTests(APITestCase):
    def setUp(self):
        self.user = create_user()
        self.client.force_authenticate(self.user)

    def test_confirming_as_foi(self):
        case = create_case()

        response = self.client.post(f'{URL}{case.id}/decide/', {'decision': 'confirm'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        case.refresh_from_db()
        self.assertEqual(case.status, FOICase.Status.CONFIRMED)
        self.assertEqual(case.decided_by, self.user)
        self.assertIsNotNone(case.decided_at)
        self.assertEqual(case.actions.count(), 1)

    def test_confirming_with_a_department_is_rejected(self):
        case = create_case()

        response = self.client.post(
            f'{URL}{case.id}/decide/', {'decision': 'confirm', 'department': Department.WASTE}, format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_routing_to_a_department(self):
        case = create_case()

        response = self.client.post(
            f'{URL}{case.id}/decide/', {'decision': 'route', 'department': Department.HOUSING}, format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        case.refresh_from_db()
        self.assertEqual(case.status, FOICase.Status.NOT_FOI)
        self.assertEqual(case.department, Department.HOUSING)

    def test_routing_without_a_department_is_rejected(self):
        case = create_case()

        response = self.client.post(f'{URL}{case.id}/decide/', {'decision': 'route'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_a_case_that_has_already_been_decided_cannot_be_decided_again(self):
        case = create_case(status=FOICase.Status.CONFIRMED)

        response = self.client.post(f'{URL}{case.id}/decide/', {'decision': 'confirm'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class StatusChangeTests(APITestCase):
    def setUp(self):
        self.user = create_user()
        self.client.force_authenticate(self.user)

    def test_marking_a_confirmed_case_as_responded(self):
        case = create_case(status=FOICase.Status.CONFIRMED)

        response = self.client.post(
            f'{URL}{case.id}/status/', {'status': 'responded', 'note': 'Sent the response letter.'}, format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        case.refresh_from_db()
        self.assertEqual(case.status, FOICase.Status.RESPONDED)
        self.assertEqual(case.actions.get().note, 'Sent the response letter.')

    def test_marking_a_responded_case_as_closed(self):
        case = create_case(status=FOICase.Status.RESPONDED)

        response = self.client.post(f'{URL}{case.id}/status/', {'status': 'closed', 'note': 'Filed.'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        case.refresh_from_db()
        self.assertEqual(case.status, FOICase.Status.CLOSED)

    def test_marking_a_not_foi_case_as_closed(self):
        case = create_case(status=FOICase.Status.NOT_FOI)

        response = self.client.post(
            f'{URL}{case.id}/status/', {'status': 'closed', 'note': 'Passed to Waste team.'}, format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        case.refresh_from_db()
        self.assertEqual(case.status, FOICase.Status.CLOSED)

    def test_cannot_skip_from_possible_straight_to_responded(self):
        case = create_case()

        response = self.client.post(f'{URL}{case.id}/status/', {'status': 'responded', 'note': 'Done.'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_a_note_is_required(self):
        case = create_case(status=FOICase.Status.CONFIRMED)

        response = self.client.post(f'{URL}{case.id}/status/', {'status': 'responded', 'note': ''}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ReopenTests(APITestCase):
    def setUp(self):
        self.user = create_user()
        self.client.force_authenticate(self.user)

    def test_reopening_a_closed_foi_case_returns_it_to_responded(self):
        case = create_case(status=FOICase.Status.RESPONDED)
        self.client.post(f'{URL}{case.id}/status/', {'status': 'closed', 'note': 'Filed.'}, format='json')

        response = self.client.post(f'{URL}{case.id}/reopen/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        case.refresh_from_db()
        self.assertEqual(case.status, FOICase.Status.RESPONDED)

    def test_reopening_a_closed_not_foi_case_returns_it_to_not_foi(self):
        case = create_case(status=FOICase.Status.NOT_FOI)
        self.client.post(f'{URL}{case.id}/status/', {'status': 'closed', 'note': 'Filed.'}, format='json')

        response = self.client.post(f'{URL}{case.id}/reopen/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        case.refresh_from_db()
        self.assertEqual(case.status, FOICase.Status.NOT_FOI)

    def test_reopening_a_case_that_is_not_closed_is_rejected(self):
        case = create_case(status=FOICase.Status.RESPONDED)

        response = self.client.post(f'{URL}{case.id}/reopen/')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AddActionTests(APITestCase):
    def setUp(self):
        self.user = create_user()
        self.client.force_authenticate(self.user)

    def test_adding_a_freeform_note_does_not_change_the_status(self):
        case = create_case(status=FOICase.Status.CONFIRMED)

        response = self.client.post(
            f'{URL}{case.id}/actions/', {'note': 'Chased up with the service team.'}, format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        case.refresh_from_db()
        self.assertEqual(case.status, FOICase.Status.CONFIRMED)
        self.assertEqual(case.actions.get().note, 'Chased up with the service team.')
