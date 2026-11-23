from datetime import UTC, date, datetime
from io import StringIO

from django.core.management import call_command
from django.test import TestCase

from inbound.models import InboundItem

from ..dates import calculate_deadline
from ..flagging import auto_flag
from ..models import FOICase


def create_item(reference='EM-1', subject='', message='', received_at=None, **extra):
    return InboundItem.objects.create(
        reference=reference, channel='email', subject=subject, message=message, received_at=received_at, **extra
    )


class SignalTests(TestCase):
    """Every InboundItem save runs the detector via the post_save signal (see ..signals)."""

    def test_an_foi_looking_item_automatically_gets_a_case(self):
        item = create_item(subject='Freedom of Information request', message='Please provide the total spent.')

        self.assertEqual(item.foi_case.status, FOICase.Status.POSSIBLE)
        self.assertIn('Mentions FOI or the Act', item.foi_case.reasons)

    def test_a_routine_item_still_gets_a_case_landing_straight_on_not_foi(self):
        item = create_item(subject='Bins', message='When is my bin collected?')

        self.assertEqual(item.foi_case.status, FOICase.Status.NOT_FOI)
        self.assertEqual(item.foi_case.confidence, FOICase.Confidence.NOT_FLAGGED)

    def test_deadline_is_calculated_from_the_received_date(self):
        item = create_item(
            subject='FOI request',
            message='Please provide the total spent on consultants.',
            received_at=datetime(2026, 11, 11, tzinfo=UTC),
        )

        self.assertIsNotNone(item.foi_case.deadline)

    def test_deadline_uses_the_local_received_date_not_the_utc_date(self):
        # 23:30 UTC in July is 00:30 the next day in Europe/London (BST, UTC+1) - a naive UTC .date()
        # would compute the deadline from the wrong day.
        item = create_item(
            subject='FOI request',
            message='Please provide the total spent on consultants.',
            received_at=datetime(2026, 7, 14, 23, 30, tzinfo=UTC),
        )

        self.assertEqual(item.foi_case.deadline, calculate_deadline(date(2026, 7, 15)))

    def test_a_naive_received_at_does_not_crash_the_deadline_calculation(self):
        # e.g. typed into the Django admin, which has no timezone widget and leaves the datetime naive.
        item = create_item(
            subject='FOI request',
            message='Please provide the total spent on consultants.',
            received_at=datetime(2026, 7, 14, 23, 30),
        )

        self.assertIsNotNone(item.foi_case.deadline)

    def test_deadline_is_null_when_the_received_date_is_unknown(self):
        item = create_item(subject='FOI request', message='Please provide the total spent on consultants.')

        self.assertIsNone(item.foi_case.deadline)

    def test_calling_auto_flag_again_does_not_duplicate_the_case(self):
        item = create_item(subject='FOI request', message='Please provide the total spent on consultants.')

        self.assertIsNone(auto_flag(item))
        self.assertEqual(FOICase.objects.filter(item=item).count(), 1)


class RescanForiCommandTests(TestCase):
    def test_backfills_cases_for_items_created_before_the_feature_existed(self):
        item = create_item(subject='FOI request', message='Please provide the total spent on consultants.')
        FOICase.objects.filter(item=item).delete()

        call_command('rescan_foi', stdout=StringIO())

        self.assertTrue(FOICase.objects.filter(item=item).exists())

    def test_running_it_twice_creates_nothing_new(self):
        create_item(subject='FOI request', message='Please provide the total spent on consultants.')

        call_command('rescan_foi', stdout=StringIO())
        count_after_first_run = FOICase.objects.count()
        call_command('rescan_foi', stdout=StringIO())

        self.assertEqual(FOICase.objects.count(), count_after_first_run)
