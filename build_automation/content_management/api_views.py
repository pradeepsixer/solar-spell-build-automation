from rest_framework import status
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.viewsets import ModelViewSet

from .exceptions import DuplicateContentFileException
from .models import Content, Tag
from .serializers import ContentSerializer, TagSerializer


class ContentApiViewset(ModelViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer

    def create(self, request):
        try:
            return super().create(request)
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

    def update(self, request, pk=None):
        try:
            return super().update(request, pk)
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
