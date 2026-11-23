from django.db import IntegrityError
from django.utils import timezone

from inbound.models import InboundItem

from .dates import calculate_deadline
from .detection import score_item
from .models import FOICase


def _received_date(item: InboundItem):
    if item.received_at is None:
        return None

    received_at = item.received_at
    # A naive datetime (e.g. typed into the Django admin, which has no timezone widget) is local
    # wall-clock time, the same assumption inbound/dates.py makes for the CSV seed path.
    if timezone.is_naive(received_at):
        received_at = timezone.make_aware(received_at)

    return timezone.localtime(received_at).date()


def auto_flag(item: InboundItem) -> FOICase | None:
    """Score an inbound item and give it a case. Every item gets one - an officer is responsible for
    closing out every message, FOI or not - but one that scores too low to need review lands
    straight on "not FOI" rather than waiting in the review queue."""
    if FOICase.objects.filter(item=item).exists():
        return None

    result = score_item(item.subject, item.message)
    status = FOICase.Status.NOT_FOI if result.confidence == 'not_flagged' else FOICase.Status.POSSIBLE

    try:
        return FOICase.objects.create(
            item=item,
            status=status,
            confidence=result.confidence,
            score=result.score,
            reasons=result.reasons,
            suggest_sar=result.suggest_sar,
            deadline=calculate_deadline(_received_date(item)),
        )
    except IntegrityError:
        # Another request flagged the same item first; the OneToOneField constraint is the real guard.
        return None
