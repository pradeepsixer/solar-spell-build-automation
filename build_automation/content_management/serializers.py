from rest_framework import serializers

from .models import Content


class ContentSerializer(serializers.HyperlinkedModelSerializer):
    def create(self, validated_data):
        content = Content(**self.validated_data)
        return self.__create_update(content, validated_data)

    def update(self, content, validated_data):
        content.name = validated_data.get('name', content.name)
        content.description = validated_data.get('description', content.description)
        content.content_file = validated_data.get('content_file', content.content_file)
        return self.__create_update(content, validated_data)

    def __create_update(self, content, validated_data):
        request = self.context['request']
        if 'content_file' in request.FILES:
            content.content_file_uploaded = True
        content.save()
        return content

    class Meta:
        model = Content
        fields = ('url', 'name', 'description', 'content_file', 'updated_time', 'last_uploaded_time')
        extra_kwargs = {
            'url': {'lookup_field': 'pk'},
        }