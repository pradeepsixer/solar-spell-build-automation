from django.apps import AppConfig


class ContentManagementConfig(AppConfig):
    name = 'content_management'
    verbose_name = 'Content Management'

    def ready(self):
        import content_management.signals  # noqa: F401
        pass
