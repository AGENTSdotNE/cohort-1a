from django.db import IntegrityError, transaction
from django.utils import timezone

from inbound.models import InboundItem

from .dates import calculate_deadline
from .detection import score_item
from .models import FOIAction, FOICase


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
    if FOICase.objects.filter(item=item).exists():
        return None

    result = score_item(item.subject, item.message)

    if result.confidence == 'not_flagged':
        return None

    try:
        return FOICase.objects.create(
            item=item,
            confidence=result.confidence,
            score=result.score,
            reasons=result.reasons,
            suggest_sar=result.suggest_sar,
            deadline=calculate_deadline(_received_date(item)),
        )
    except IntegrityError:
        # Another request flagged the same item first; the OneToOneField constraint is the real guard.
        return None


def create_manual_case(item: InboundItem, *, decision: str, user, department: str = '') -> FOICase:
    """Let a receiving-party officer flag an item the detector missed, or route a non-FOI item straight away."""
    if FOICase.objects.filter(item=item).exists():
        raise ValueError('This item already has a case.')

    if decision == 'flag':
        return _flag_manually(item, user)

    if decision == 'route':
        if not department:
            raise ValueError('department is required to route an item.')

        return _route_manually(item, department, user)

    raise ValueError(f'Unknown decision: {decision}')


def _flag_manually(item: InboundItem, user) -> FOICase:
    try:
        with transaction.atomic():
            case = FOICase.objects.create(
                item=item,
                confidence=FOICase.Confidence.MANUAL,
                score=0,
                reasons=['Manually flagged'],
                deadline=calculate_deadline(_received_date(item)),
            )
            FOIAction.objects.create(case=case, note='Manually flagged as possible FOI.', created_by=user)
    except IntegrityError:
        raise ValueError('This item already has a case.') from None

    return case


def _route_manually(item: InboundItem, department: str, user) -> FOICase:
    try:
        with transaction.atomic():
            case = FOICase.objects.create(
                item=item,
                status=FOICase.Status.NOT_FOI,
                confidence=FOICase.Confidence.MANUAL,
                score=0,
                reasons=['Manually marked as not FOI'],
                department=department,
                decided_by=user,
                decided_at=timezone.now(),
            )
            note = f'Manually marked as not FOI and routed to {case.get_department_display()}.'
            FOIAction.objects.create(case=case, note=note, created_by=user)
    except IntegrityError:
        raise ValueError('This item already has a case.') from None

    return case
