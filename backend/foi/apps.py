from django.apps import AppConfig


class FoiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'foi'

    def ready(self):
        from . import signals  # noqa: F401
