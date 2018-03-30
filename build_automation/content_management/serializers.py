from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator, UniqueValidator

from content_management.models import Content, Directory, DirectoryLayout, FilterCriteria, Tag
from content_management.utils import FilterCriteriaUtil


class ContentSerializer(serializers.HyperlinkedModelSerializer):
    tag_ids = serializers.PrimaryKeyRelatedField(many=True, read_only=False, queryset=Tag.objects.all(), source='tag')

    def create(self, validated_data):

        tag_list = []
        for tag in validated_data['tag']:
            tag_list.append(tag)
        del validated_data['tag']
        content = Content(**validated_data)
        return self.__create_update(content, tag_list)

    def update(self, content, validated_data):
        content.name = validated_data.get('name', content.name)
        content.description = validated_data.get('description', content.description)
        content.content_file = validated_data.get('content_file', content.content_file)

        tag_list = []
        if 'tag' in validated_data:
            for tag in validated_data['tag']:
                tag_list.append(tag)
            content.tag.set(tag_list)
        return self.__create_update(content)

    def __create_update(self, content, tag_list=None):
        request = self.context['request']
        if 'content_file' in request.FILES:
            content.content_file_uploaded = True
        content.save()
        if tag_list is not None:
            content.tag.set(tag_list)
        return content

    class Meta:
        model = Content
        fields = ('url', 'name', 'description', 'content_file', 'updated_time', 'last_uploaded_time', 'tag_ids')
        extra_kwargs = {
            'url': {'lookup_field': 'pk'},
        }


class TagSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        max_length=50, validators=[
            UniqueValidator(
                queryset=Tag.objects.all(),
                message={
                    'error': 'DUPLICATE_TAG_NAME'
                },
                lookup='iexact'
            )
        ]
    )

    class Meta:
        model = Tag
        fields = ('id', 'url', 'name', 'description', 'parent', 'child_tags')
        extra_kwargs = {
            'url': {'lookup_field': 'pk'},
        }


class DirectoryLayoutSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        max_length=50,
        validators=[
            UniqueValidator(
                queryset=DirectoryLayout.objects.all(),
                message=('Duplicate layout exists')
            )
        ]
    )

    class Meta:
        model = DirectoryLayout
        fields = '__all__'


class FilterCriteriaField(serializers.CharField):
    """
    For serializing the filter criteria to a single string representation.
    """

    def to_representation(self, obj):
        return obj.get_filter_criteria_string()


class DirectorySerializer(serializers.ModelSerializer):
    """
    Create and Update functions to override the value of filter_criteria
    """

    filter_criteria = FilterCriteriaField(max_length=500)

    def create(self, validated_data):
        filtercriteria_util = FilterCriteriaUtil()
        validated_data_copy = dict(validated_data)
        filter_criteria_value = filtercriteria_util.create_filter_criteria_from_string(
            validated_data.get('filter_criteria'))
        validated_data_copy['filter_criteria'] = filter_criteria_value
        return Directory.objects.create(**validated_data_copy)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.dir_layout = validated_data.get('dir_layout', instance.dir_layout)
        if 'filter_criteria' in validated_data:
            FilterCriteria.objects.filter(directory=instance).delete()
            criteria_util = FilterCriteriaUtil()
            instance.filter_criteria = criteria_util.create_filter_criteria_from_string(
                validated_data.get('filter_criteria'))
        instance.parent = validated_data.get('parent', instance.parent)
        instance.save()
        return instance

    class Meta:
        model = Directory
        fields = ('id', 'name', 'dir_layout', 'filter_criteria', 'parent')
        validators = [
            UniqueTogetherValidator(
                queryset=Directory.objects.all(),
                fields=('name', 'parent'),
                message=('The subdirectory for the parent already exists.')
            )
        ]
