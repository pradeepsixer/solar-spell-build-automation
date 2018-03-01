from rest_framework import serializers

from .models import Content, Tag


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
    class Meta:
        model = Tag
        fields = ('url', 'name', 'description', 'parent', 'child_tags')
        extra_kwargs = {
            'url': {'lookup_field': 'pk'},
        }
