from django.utils import timezone

from inbound.models import InboundItem

from .dates import calculate_deadline
from .detection import score_item
from .models import FOIAction, FOICase


def auto_flag(item: InboundItem) -> FOICase | None:
    if FOICase.objects.filter(item=item).exists():
        return None

    result = score_item(item.subject, item.message)

    if result.confidence == 'not_flagged':
        return None

    return FOICase.objects.create(
        item=item,
        confidence=result.confidence,
        score=result.score,
        reasons=result.reasons,
        suggest_sar=result.suggest_sar,
        deadline=calculate_deadline(item.received_at.date() if item.received_at else None),
    )


def create_manual_case(item: InboundItem, *, decision: str, user, department: str = '') -> FOICase:
    """Let a receiving-party officer flag an item the detector missed, or route a non-FOI item straight away."""
    if FOICase.objects.filter(item=item).exists():
        raise ValueError('This item already has a case.')

    if decision == 'flag':
        case = FOICase.objects.create(
            item=item,
            confidence=FOICase.Confidence.MANUAL,
            score=0,
            reasons=['Manually flagged'],
            deadline=calculate_deadline(item.received_at.date() if item.received_at else None),
        )
        note = 'Manually flagged as possible FOI.'
    elif decision == 'route':
        if not department:
            raise ValueError('department is required to route an item.')

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
    else:
        raise ValueError(f'Unknown decision: {decision}')

    FOIAction.objects.create(case=case, note=note, created_by=user)

    return case
