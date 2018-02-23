from django.db import models
from django.urls import reverse #Used to generate URLs by reversing the URL patterns

class Content(models.Model):
    """
    A content is the representation of a file.
    """
    name = models.CharField(max_length=50)

    description = models.TextField()

    # The Actual File
    content_file = models.FileField("File")

    created_time = models.DateTimeField(
        "First uploaded on",
        auto_now_add=True,
        help_text='Date & Time when the file was uploaded for the first time'
    )

    last_updated_time = models.DateTimeField(
        "Last updated on",
        editable=False,
        help_text='Date & Time when the file was updated recently'
    )

    # SHA-256 Checksum of the latest updated file.
    checksum = models.SlugField(
        "SHA256 Sum",
        max_length=65,
        editable=False,
        help_text='SHA256 Sum of the file uploaded recently.'
    )

    content_file_uploaded = False

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.original_file = self.content_file

    def __str__(self):
        return self.name


class ContentType(models.Model):
    """
    Model representing a content type (e.g. Video, Audio, Document, etc.).
    """
    type = models.CharField(max_length=50, help_text="What kind of content is this? (e.g. Video, Audio, Document, etc.)")

    def __str__(self):
        return self.type


class Topic(models.Model):
    """
    Model representing a topic (e.g. Math, Physics, etc.).
    """
    topic = models.CharField(max_length=200, help_text="Enter a topic (e.g. Math, Physics, etc.)")

    def __str__(self):
        return self.topic


class Category(models.Model):
    """
    Model representing a category (e.g. Voice of America, etc.).
    """
    category = models.CharField(max_length=200, help_text="Enter a category (e.g. Voice of America, etc.)")

    def __str__(self):
        return self.category


class GeoTag(models.Model):
    """
    Model representing a geotag.
    """
    geotag = models.CharField(max_length=200, help_text="Enter a region.")

    def __str__(self):
        return self.geotag


class Author(models.Model):
    first_name = models.CharField(max_length=100, default="Anon")
    last_name = models.CharField(max_length=100, default="Anon")

    class Meta:
        ordering = ["last_name", "first_name"]

    def get_absolute_url(self):

        return reverse('author-detail', args=[str(self.id)])

    def __str__(self):

        return '{0}, {1}'.format(self.last_name, self.first_name)