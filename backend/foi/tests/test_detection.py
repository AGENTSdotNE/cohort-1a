from django.test import SimpleTestCase

from ..detection import score_item


class ScoreItemTests(SimpleTestCase):
    def test_explicit_foi_mention_scores_high(self):
        result = score_item(
            'Freedom of Information request',
            'Please provide the total amount spent on consultants, broken down by department.',
        )

        self.assertEqual(result.confidence, 'high')
        self.assertIn('Mentions FOI or the Act', result.reasons)

    def test_a_request_for_figures_without_foi_wording_is_unclear(self):
        result = score_item('Bin collections', 'How many missed collections were there on Park Road last year?')

        self.assertEqual(result.confidence, 'unclear')

    def test_a_routine_service_question_is_not_flagged(self):
        result = score_item('Bins', 'When is my bin collected?')

        self.assertEqual(result.confidence, 'not_flagged')
        self.assertEqual(result.reasons, [])

    def test_supplier_mail_is_never_flagged_even_with_other_signals(self):
        result = score_item('Invoice overdue', 'Please send the purchase order reference, invoice attached.')

        self.assertEqual(result.confidence, 'not_flagged')

    def test_explicit_mention_overrides_supplier_looking_mail(self):
        result = score_item(
            'Freedom of Information request',
            'Under the Freedom of Information Act, please provide copies of every invoice attached to contract C-100.',
        )

        self.assertIn(result.confidence, {'medium', 'high'})

    def test_asking_for_the_senders_own_data_suggests_sar_but_does_not_flag(self):
        result = score_item('My data', 'I want a copy of all the data you hold about me.')

        self.assertEqual(result.confidence, 'not_flagged')
        self.assertTrue(result.suggest_sar)

    def test_matching_is_case_insensitive(self):
        result = score_item('FOI REQUEST', 'PLEASE PROVIDE THE TOTAL SPENT.')

        self.assertEqual(result.confidence, 'high')


class RealSampleDataTests(SimpleTestCase):
    """Sanity-checks the scorer against real messages from inbound/sample_data.csv."""

    def test_the_real_foi_request_in_the_sample_data_scores_high(self):
        result = score_item(
            'Freedom of Information request - agency staff',
            'Under the Freedom of Information Act, please provide the total amount the council spent on agency '
            'staff in 2025/26, broken down by department.',
        )

        self.assertEqual(result.confidence, 'high')

    def test_the_real_invoice_reminder_in_the_sample_data_is_not_flagged(self):
        result = score_item(
            'Invoice INV-20931 overdue',
            'Please find attached a reminder for invoice INV-20931 (grounds maintenance, August). Payment is now '
            '30 days overdue.',
        )

        self.assertEqual(result.confidence, 'not_flagged')
