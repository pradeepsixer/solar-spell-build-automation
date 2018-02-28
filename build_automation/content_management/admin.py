from django.contrib import admin
from .models import Tag


class TagAdmin(admin.ModelAdmin):
    list_display = ()  # TODO Do we need this?


# Register the admin class with the associated model
admin.site.register(Tag, TagAdmin)
