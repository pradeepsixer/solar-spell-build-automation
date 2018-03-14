from django.shortcuts import render
from .models import Tag, Content
from django.views import generic


def index(request):
    num_content = Content.objects.all().count()
    num_tags = Tag.objects.all().count()
    num_visits = request.session.get('num_visits', 0)
    request.session['num_visits'] = num_visits + 1

    return render(
        request,
        'index.html',
        context={'num_content': num_content, 'num_tags': num_tags, 'num_visits': num_visits},
    )


class ContentListView(generic.ListView):
    model = Content
    context_object_name = 'content_list'
    paginate_by = 10


class ContentDetailView(generic.DetailView):
    model = Content
