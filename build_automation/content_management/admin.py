from django.contrib import admin, messages
from django.urls import reverse
from django.utils.safestring import mark_safe

from .exceptions import DuplicateContentFileException
from .models import Author, Topic, Content, ContentType, GeoTag, Category


class ContentAdmin(admin.ModelAdmin):
    readonly_fields = ('created_time', 'last_updated_time',)
    list_display = ('id', 'name', 'content_file', 'created_time', 'last_updated_time',)

    def save_model(self, request, obj, form, change):
        if 'content_file' in request.FILES:
            obj.content_file_uploaded = True
        try:
            super().save_model(request, obj, form, change)
        except DuplicateContentFileException as dup:
            edit_url = reverse(
                            'admin:%s_%s_change' % (obj._meta.app_label, obj._meta.model_name),
                            args=[dup.content.pk]
                        )
            messages.set_level(request, messages.ERROR)
            messages.error(
                request,
                mark_safe(
                    "<strong>The uploaded file already exists \"<a href='%s'>here</a>\"</strong>" % edit_url
                )
            )

admin.site.register(Author)
admin.site.register(Topic)
admin.site.register(ContentType)
admin.site.register(Category)
admin.site.register(GeoTag)
admin.site.register(Content, ContentAdmin)
