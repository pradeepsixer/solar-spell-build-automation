from rest_framework import filters, status
from rest_framework.mixins import CreateModelMixin, ListModelMixin
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.viewsets import ModelViewSet, ViewSet

from content_management.exceptions import DuplicateContentFileException
from content_management.models import (
    Cataloger, Content, Coverage, Creator, Directory, DirectoryLayout, Keyword, Language, Subject, Workarea
)
from content_management.serializers import (
    CatalogerSerializer, ContentSerializer, CoverageSerializer, CreatorSerializer, DirectoryLayoutSerializer,
    DirectorySerializer, KeywordSerializer, LanguageSerializer, SubjectSerializer, WorkareaSerializer
)


class ContentApiViewset(ModelViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name', 'description')

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


class CreatorViewSet(ModelViewSet):
    serializer_class = CreatorSerializer
    queryset = Creator.objects.all()


class CoverageViewSet(ModelViewSet):
    serializer_class = CoverageSerializer
    queryset = Coverage.objects.all()


class SubjectViewSet(ModelViewSet):
    serializer_class = SubjectSerializer
    queryset = Subject.objects.all()


class KeywordViewSet(ModelViewSet):
    serializer_class = KeywordSerializer
    queryset = Keyword.objects.all()


class WorkareaViewSet(ModelViewSet):
    serializer_class = WorkareaSerializer
    queryset = Workarea.objects.all()


class LanguageViewSet(ModelViewSet):
    serializer_class = LanguageSerializer
    queryset = Language.objects.all()


class CatalogerViewSet(ModelViewSet):
    serializer_class = CatalogerSerializer
    queryset = Cataloger.objects.all()


class DirectoryLayoutViewSet(ModelViewSet):
    serializer_class = DirectoryLayoutSerializer
    queryset = DirectoryLayout.objects.all()


class DirectoryViewSet(ModelViewSet):
    serializer_class = DirectorySerializer
    queryset = Directory.objects.all()


class DirectoryCloneApiViewSet(ViewSet, CreateModelMixin):
    serializer_class = DirectoryLayoutSerializer
    CLONE_SUFFIX = "_clone"

    def create(self, request, *args, **kwargs):
        original_layout = self.get_queryset()
        if(DirectoryLayout.objects.filter(name=original_layout.name + self.CLONE_SUFFIX).count() >= 1):
            dir = DirectoryLayout.objects.get(name=original_layout.name + self.CLONE_SUFFIX)
            layout_url = reverse('directorylayout-detail', args=[dir.id], request=request)
            data = {
                'result': 'error',
                'error': 'DIRECTORY_LAYOUT_ALREADY_EXISTS',
                'existing_directory_layout': {
                    'directory_layout_name': original_layout.name + self.CLONE_SUFFIX,
                    'directory_layout': layout_url
                }
            }
            return Response(data, status=status.HTTP_409_CONFLICT)
        cloned_layout = DirectoryLayout(
            name=original_layout.name + self.CLONE_SUFFIX, description=original_layout.description
        )
        cloned_layout.pk = None
        cloned_layout.save()

        dir_queryset = Directory.objects.filter(dir_layout=original_layout, parent=None)
        self.__clone_directory_tree(None, cloned_layout, dir_queryset, None)

        serializer = DirectoryLayoutSerializer(cloned_layout, context={'request': request})
        return Response(serializer.data)

    def get_queryset(self, **kwargs):
        queryset = DirectoryLayout.objects.get(id=self.kwargs['id'])
        return queryset

    def __clone_directory_tree(
            self, filter_criteria_util, cloned_dir_layout,
            original_directories, parent_cloned_directory):
        for each_original_directory in original_directories:
            cloned_directory = Directory(name=each_original_directory.name)
            cloned_directory.dir_layout = cloned_dir_layout
            cloned_directory.parent = parent_cloned_directory
            cloned_directory.banner_file = each_original_directory.banner_file
            cloned_directory.save()
            cloned_directory.individual_files.set(list(each_original_directory.individual_files.all()))
            cloned_directory.creators.set(list(each_original_directory.creators.all()))
            cloned_directory.coverages.set(list(each_original_directory.coverages.all()))
            cloned_directory.subjects.set(list(each_original_directory.subjects.all()))
            cloned_directory.keywords.set(list(each_original_directory.keywords.all()))
            cloned_directory.workareas.set(list(each_original_directory.workareas.all()))
            cloned_directory.languages.set(list(each_original_directory.languages.all()))
            cloned_directory.catalogers.set(list(each_original_directory.catalogers.all()))
            cloned_directory.save()
            self.__clone_directory_tree(
                filter_criteria_util, cloned_dir_layout,
                each_original_directory.subdirectories.all(), cloned_directory
            )


class AllTagsApiViewSet(ViewSet, ListModelMixin):
    """
    Get all kinds of tags in a single API call
    creator, coverage, subjects, workareas, keywords, language and cataloger
    """
    def list(self, request, *args, **kwarsgs):
        response_data = {
            'creators': Creator.objects.all().values(),
            'coverages': Coverage.objects.all().values(),
            'subjects': Subject.objects.all().values(),
            'keywords': Keyword.objects.all().values(),
            'workareas': Workarea.objects.all().values(),
            'languages': Language.objects.all().values(),
            'catalogers': Cataloger.objects.all().values(),
        }
        return Response(response_data, status=status.HTTP_200_OK)
