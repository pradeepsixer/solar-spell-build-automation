from django.shortcuts import render
from .models import Tag, Content


def index(request):
    num_content = Content.objects.all().count()
    num_tags = Tag.objects.all().count()

    return render(
        request,
        'index.html',
        context={'num_content': num_content, 'num_tags': num_tags},
    )
