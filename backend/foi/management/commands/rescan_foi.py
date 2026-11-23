from django.core.management.base import BaseCommand

from foi.flagging import auto_flag
from inbound.models import InboundItem


class Command(BaseCommand):
    help = 'Create FOI cases for any inbound items that look like FOI requests but do not have one yet.'

    def handle(self, *args, **options):
        items = InboundItem.objects.filter(foi_case__isnull=True)
        created = sum(1 for item in items if auto_flag(item) is not None)

        self.stdout.write(f'{created} new FOI case(s) created.')
