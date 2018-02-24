from django.db import models


class Content(models.Model):
    """
    A content is the representation of a file.
    """
    name = models.CharField(max_length=50)

    description = models.TextField()

    # The Actual File
    content_file = models.FileField("File")

    updated_time = models.DateTimeField(
        "Content updated on",
        help_text='Date & Time when the content was updated recently'
    )

    last_uploaded_time = models.DateTimeField(
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
