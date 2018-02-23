from django.shortcuts import render
# from .models import Author, Topic, Content, Tag
from django.http import HttpResponse


def index(request):
    """
    View function for home page of site.
    """
    return render(
        request,
        'Spell.html',
    )


def home(request):
    """
    Home page for the application.
    """
    return render(
        request,
        'Spell.html'
    )


def creative_arts(request):
    """
    Creative Arts page
    """
    return render(
        request,
        'CreativeArts.html'
    )


def culinary_arts(request):
    """
    Culinary Arts page
    """
    return render(
        request,
        'CulinaryArts.html'
    )


def pacific_islands(request):
    """
    Pacific Islands Resources
    """
    return render(
        request,
        'PacificIslandsArtsAndCulture.html'
    )


def teaching_resources(request):
    """
    Teaching resources
    """
    return render(
        request,
        'TeachingResources.html'
    )


def search(request):
    limit = int(request.GET.get('limit', '10'))
    offset = int(request.GET.get('offset', '0'))
    query_str = request.GET.get('query', '')
    # stmt = "select C.id, C.name from django_test_content C INNER JOIN (SELECT CT.content_id from django_test_content_tags CT INNER JOIN django_test_tag T on CT.tag_id=T.id where T.name LIKE ('%%{}%%') limit {} offset {}) EXC on EXC.content_id=C.id".format(query_str, limit, offset)
    # result = Content.objects.raw(stmt)
    result = Content.objects.filter(tags__name__icontains=query_str).all()[offset:offset+limit]
    print(result.query)
    context = {'contents': result, 'sqlstmt': str(result.query)}
    return render(request, 'search.html', context)
