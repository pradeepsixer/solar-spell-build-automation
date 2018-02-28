from django.db import models
from django.urls import reverse #Used to generate URLs by reversing the URL patterns


class Tag(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=200, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True)

    def get_absolute_url(self):

        return reverse('tag_detail', args=[str(self.id)])

    def __str__(self):
        return self.name

