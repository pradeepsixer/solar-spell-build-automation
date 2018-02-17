from django.contrib import admin
from .models import Author, Topic, Video

# admin.site.register(Author)
# admin.site.register(Topic)
# admin.site.register(Video)

# Define the admin class
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'author')

# Register the admin class with the associated model
admin.site.register(Video, VideoAdmin)