from django.db import models
from django.urls import reverse #Used to generate URLs by reversing the URL patterns


class Content(models.Model):
    """
    Model representing a piece of content.
    """
    title = models.CharField(max_length=200)
    author = models.ForeignKey('Author', on_delete=models.SET_NULL, null=True)
    # Foreign Key used because the video may only have one author, but authors can have multiple videos
    # Author as a string rather than object because it hasn't been declared yet in the file.
    summary = models.TextField(max_length=1000, help_text="Enter a brief description of the video")
    topic = models.ManyToManyField('Topic', help_text="Select a topic for this content")
    content_type = models.CharField(max_length=50)
    geotag = models.CharField(max_length=50)
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        """
        String for representing the Model object.
        """
        return self.title


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