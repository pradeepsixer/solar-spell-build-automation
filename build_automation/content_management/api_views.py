from rest_framework import status
from rest_framework import filters
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.viewsets import ModelViewSet

from .exceptions import DuplicateContentFileException
from .models import Content, Tag
from .serializers import ContentSerializer, TagSerializer


class TagApiViewset(ModelViewSet):
    queryset = Content.objects.all()
    serializer_class = TagSerializer


class ContentApiViewset(ModelViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except DuplicateContentFileException as dup:
            content_url = reverse('content-detail', args=[dup.content.pk], request=request)
            data = {
                'result': 'error',
                'error': 'DUPLICATE_FILE_UPLOADED',
                'existing_content': {
                    'content_url': content_url,
                    'file_url': request.build_absolute_uri(dup.content.content_file.url)
                }
            }
            return Response(data, status=status.HTTP_409_CONFLICT)

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except DuplicateContentFileException as dup:
            content_url = reverse('content-detail', args=[dup.content.pk], request=request)
            data = {
                'result': 'error',
                'error': 'DUPLICATE_FILE_UPLOADED',
                'existing_content': {
                    'content_url': content_url,
                    'file_url': request.build_absolute_uri(dup.content.content_file.url)
                }
            }
            return Response(data, status=status.HTTP_409_CONFLICT)


class TagViewSet(ModelViewSet):
    serializer_class = TagSerializer
    queryset = Tag.objects.all()
    filter_backends = (filters.SearchFilter,)
    search_fields = ('description', 'name')

    def get_queryset(self):
        ids = set()
        queryset = Tag.objects.all()
        search_param = self.request.query_params.get('search', None)
        if search_param is not None:
            matching_result = Tag.objects.filter(name__contains=search_param)
            for res in matching_result:
                child = res.child_tags.all()
                for c in child:
                    ids.add(c)
                ids.add(matching_result)
            print(ids)
        return queryset