from django.db.models.signals import post_save
from django.dispatch import receiver

from inbound.models import InboundItem

from .flagging import auto_flag


@receiver(post_save, sender=InboundItem)
def flag_possible_foi(sender, instance, **kwargs):
    auto_flag(instance)
