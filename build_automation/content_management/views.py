from django.shortcuts import render
from .models import Tag, Content


def index(request):
    num_content = Content.objects.all().count()
    num_tags = Tag.objects.all().count()
    num_videos = Content.objects.filter(status__exact='v').count()

    return render(
        request,
        'index.html',
        context={'num_content': num_content, 'num_tags': num_tags, 'num_videos': num_videos},
    )
