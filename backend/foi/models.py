from django.conf import settings
from django.db import models
from django.utils import timezone

from inbound.models import InboundItem


class Department(models.TextChoices):
    HOUSING = 'housing', 'Housing'
    COUNCIL_TAX = 'council_tax', 'Council Tax'
    PLANNING = 'planning', 'Planning'
    WASTE = 'waste', 'Waste & Recycling'
    FINANCE = 'finance', 'Finance'
    LEGAL = 'legal', 'Legal'
    CUSTOMER_SERVICES = 'customer_services', 'Customer Services'
    OTHER = 'other', 'Other'


class FOICase(models.Model):
    class Status(models.TextChoices):
        POSSIBLE = 'possible', 'Possible FOI'
        CONFIRMED = 'confirmed', 'FOI'
        RESPONDED = 'responded', 'Responded'
        CLOSED = 'closed', 'Closed'
        NOT_FOI = 'not_foi', 'Not FOI'

    class Confidence(models.TextChoices):
        HIGH = 'high', 'High'
        MEDIUM = 'medium', 'Medium'
        UNCLEAR = 'unclear', 'Unclear'
        MANUAL = 'manual', 'Manual'

    item = models.OneToOneField(InboundItem, on_delete=models.CASCADE, related_name='foi_case')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.POSSIBLE)
    confidence = models.CharField(max_length=10, choices=Confidence.choices)
    score = models.IntegerField()
    reasons = models.JSONField(default=list)
    # Set when the detector thinks this might really be a subject access request rather than FOI.
    suggest_sar = models.BooleanField(default=False)
    department = models.CharField(max_length=30, choices=Department.choices, blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='owned_foi_cases'
    )
    deadline = models.DateField(null=True, blank=True)
    decided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='+'
    )
    decided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.item.reference} ({self.get_status_display()})'

    @property
    def is_overdue(self):
        if self.deadline is None:
            return False

        return self.deadline < timezone.localdate() and self.status not in {self.Status.CLOSED, self.Status.NOT_FOI}


class FOIAction(models.Model):
    case = models.ForeignKey(FOICase, on_delete=models.CASCADE, related_name='actions')
    note = models.TextField()
    new_status = models.CharField(max_length=20, choices=FOICase.Status.choices, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.case.item.reference}: {self.note[:50]}'
