from django.db import models
from django.urls import reverse  # Used to generate URLs by reversing the URL patterns


class AbstractTag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=200, null=True)

    class Meta:
        abstract = True


class Creator(AbstractTag):

    def get_absolute_url(self):
        return reverse('creator-detail', args=[str(self.id)])

    def __str__(self):
        return "Creator[{}]".format(self.name)

    class Meta:
        ordering = ['name']


class Coverage(AbstractTag):

    def get_absolute_url(self):
        return reverse('coverage-detail', args=[str(self.id)])

    def __str__(self):
        return "Coverage[{}]".format(self.name)

    class Meta:
        ordering = ['name']


class Subject(AbstractTag):

    def get_absolute_url(self):
        return reverse('subject-detail', args=[str(self.id)])

    def __str__(self):
        return "Subject[{}]".format(self.name)

    class Meta:
        ordering = ['name']


class Keyword(AbstractTag):

    def get_absolute_url(self):
        return reverse('keyword-detail', args=[str(self.id)])

    def __str__(self):
        return "Keyword[{}]".format(self.name)

    class Meta:
        ordering = ['name']


class Workarea(AbstractTag):

    def get_absolute_url(self):
        return reverse('workarea-detail', args=[str(self.id)])

    def __str__(self):
        return "Workarea[{}]".format(self.name)

    class Meta:
        ordering = ['name']


class Language(AbstractTag):

    def get_absolute_url(self):
        return reverse('language-detail', args=[str(self.id)])

    def __str__(self):
        return "Language[{}]".format(self.name)

    class Meta:
        ordering = ['name']


class Cataloger(AbstractTag):

    def get_absolute_url(self):
        return reverse('cataloger-detail', args=[str(self.id)])

    def __str__(self):
        return "Cataloger[{}]".format(self.name)

    class Meta:
        ordering = ['name']


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

    creators = models.ManyToManyField(Creator)
    coverage = models.ForeignKey(Coverage, on_delete=models.SET_NULL, null=True)
    subjects = models.ManyToManyField(Subject)
    keywords = models.ManyToManyField(Keyword)
    workareas = models.ManyToManyField(Workarea)
    language = models.ForeignKey(Language, on_delete=models.SET_NULL, null=True)
    cataloger = models.ForeignKey(Cataloger, on_delete=models.SET_NULL, null=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.original_file = self.content_file

    def __str__(self):
        return "Content[{}]".format(self.name)

    def get_absolute_url(self):
        return reverse('content-detail', args=[self.pk])

    class Meta:
        ordering = ['pk']


class DirectoryLayout(models.Model):
    """
    The Directory Layout for each build.
    """
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=200, null=True)

    def __str__(self):
        return "DirectoryLayout[{}]".format(self.name)

    class Meta:
        ordering = ['pk']


class Directory(models.Model):
    """
    Representation of the directory for each build.
    """
    name = models.CharField(max_length=50)
    dir_layout = models.ForeignKey(DirectoryLayout, related_name='directories', on_delete=models.CASCADE)
    parent = models.ForeignKey('self', related_name='subdirectories', on_delete=models.CASCADE, null=True)
    individual_files = models.ManyToManyField(Content, related_name='individual_files')

    def __str__(self):
        return "Directory[{}]".format(self.name)

    class Meta:
        ordering = ['pk']
