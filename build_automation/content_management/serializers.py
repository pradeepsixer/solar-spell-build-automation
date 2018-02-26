from rest_framework import serializers

from .models import Content, Tag


class TagSerializer(serializers.ModelSerializer):
    #id = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = Tag
        fields = '__all__'

class ContentSerializer(serializers.HyperlinkedModelSerializer):
    #tag = serializers.SlugRelatedField(many=True, read_only=True, slug_field='id')
    #tag_ids = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    #tag = serializers.ModelSerializer(many=True, read_only=True)
    tag = TagSerializer(required=False)
    def create(self, validated_data):
        content = Content(**self.validated_data)
        return self.__create_update(content, validated_data)

    def update(self, content, validated_data):
        content.name = validated_data.get('name', content.name)
        content.description = validated_data.get('description', content.description)
        content.content_file = validated_data.get('content_file', content.content_file)
        content.tag = validated_data.get('tag', content.tag)
        return self.__create_update(content, validated_data)

    def __create_update(self, content, validated_data):
        request = self.context['request']
        if 'content_file' in request.FILES:
            content.content_file_uploaded = True
        content.save()
        return content

    class Meta:
        model = Content
        fields = ('url', 'name', 'description', 'content_file', 'updated_time', 'last_uploaded_time', 'tag')
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
