# from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .exceptions import DuplicateContentFileException
from .models import Content
from .serializers import ContentSerializer


class ContentApiViewset(ModelViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer

    def create(self, request):
        try:
            super().create(request)
        except DuplicateContentFileException as dup_exception:
            return Response(status=status.HTTP_409_CONFLICT)
