from datetime import date

from django.test import SimpleTestCase

from ..dates import calculate_deadline, is_working_day, next_working_day


class WorkingDayTests(SimpleTestCase):
    def test_weekday_is_a_working_day(self):
        self.assertTrue(is_working_day(date(2026, 11, 11)))

    def test_weekend_is_not_a_working_day(self):
        self.assertFalse(is_working_day(date(2026, 11, 14)))
        self.assertFalse(is_working_day(date(2026, 11, 15)))

    def test_bank_holiday_is_not_a_working_day(self):
        self.assertFalse(is_working_day(date(2026, 12, 25)))

    def test_next_working_day_leaves_a_working_day_unchanged(self):
        self.assertEqual(next_working_day(date(2026, 11, 11)), date(2026, 11, 11))

    def test_next_working_day_rolls_a_saturday_forward_to_monday(self):
        self.assertEqual(next_working_day(date(2026, 11, 14)), date(2026, 11, 16))

    def test_next_working_day_rolls_past_a_bank_holiday(self):
        self.assertEqual(next_working_day(date(2026, 12, 25)), date(2026, 12, 29))


class CalculateDeadlineTests(SimpleTestCase):
    def test_worked_example_with_no_holidays_in_the_window(self):
        self.assertEqual(calculate_deadline(date(2026, 11, 11)), date(2026, 12, 9))

    def test_a_request_received_on_a_weekend_counts_from_the_following_monday(self):
        self.assertEqual(calculate_deadline(date(2026, 11, 14)), calculate_deadline(date(2026, 11, 16)))

    def test_unknown_received_date_needs_review(self):
        self.assertIsNone(calculate_deadline(None))

    def test_a_deadline_beyond_the_holiday_list_needs_review(self):
        self.assertIsNone(calculate_deadline(date(2027, 12, 20)))
