from django.contrib import admin
from .models import Author, Topic, Content, ContentType, GeoTag, Category

admin.site.register(Author)
admin.site.register(Topic)
admin.site.register(ContentType)
admin.site.register(Category)
admin.site.register(GeoTag)


# Define the admin class
class ContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'content_type', 'geotag', 'date')


# Register the admin class with the associated model
admin.site.register(Content, ContentAdmin)