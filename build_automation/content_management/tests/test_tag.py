import json

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from content_management.models import Content, Tag


class TagTest(APITestCase):
    def test_create_content_tags(self):
        test_file = SimpleUploadedFile('test.txt', b'sample content')
        tag_url = reverse('tag-list')
        tag_post = self.client.post(tag_url, {
            "name": "test_tag",
            "description": "test_description",
            "child_tags": []}
        )
        self.assertEqual(tag_post.status_code, status.HTTP_201_CREATED)

        tagid = Tag.objects.first().pk

        content_url = reverse('content-list')
        resp_post = self.client.post(
            content_url, {
                "name": "test_content",
                "description": "test_desc",
                "updated_time": timezone.now(),
                "content_file": test_file,
                "tag_ids": tagid
            }, format='multipart'
        )
        self.assertEqual(resp_post.status_code, status.HTTP_201_CREATED)
        js = json.loads(resp_post.content.decode('utf-8'))
        self.assertIn(tagid, js['tag_ids'])

    def test_untag_content_tags(self):
        """
        Asserts that the tags are properly unlinked from the content.
        """

        test_file = SimpleUploadedFile('test.txt', b'sample content')
        tag_url_list = reverse('tag-list')
        tag_post = self.client.post(
            tag_url_list, {
                "name": "test_tag",
                "description": "test_description",
                "child_tags": []
            }
        )
        self.assertEqual(tag_post.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Tag.objects.count(), 1)

        tagid = Tag.objects.first().pk

        content_url_list = reverse('content-list')
        resp_post = self.client.post(
            content_url_list, {
                "name": "test_content",
                "description": "test_desc",
                "updated_time": timezone.now(),
                "content_file": test_file,
                "tag_ids": tagid
            }, format='multipart'
        )
        self.assertEqual(resp_post.status_code, status.HTTP_201_CREATED)

        resp_get = self.client.get(content_url_list)
        self.assertEqual(resp_get.status_code, status.HTTP_200_OK)

        content_url = reverse('content-detail', args=[Content.objects.first().pk])
        unlink_post = self.client.patch(
            content_url, {
                'tag_ids': []
            }, format='json')
        self.assertEqual(unlink_post.status_code, status.HTTP_200_OK)

        content_url = reverse('content-detail', args=[Content.objects.first().pk])
        content_get = self.client.get(content_url)
        js = json.loads(content_get.content.decode('utf-8'))
        self.assertNotIn(tagid, js['tag_ids'])

    def test_delete_tags(self):
        """
        Asserts that the tag is successfully unlinked from the content, when the tag is deleted.
        """

        test_file = SimpleUploadedFile('test.txt', b'sample content')
        tag_url_list = reverse('tag-list')
        tag_post = self.client.post(
            tag_url_list, {
                "name": "test_tag",
                "description": "test_description",
                "child_tags": []
            }
        )
        self.assertEqual(tag_post.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Tag.objects.count(), 1)

        tagid = Tag.objects.first().pk

        content_url_list = reverse('content-list')
        resp_post = self.client.post(
            content_url_list, {
                "name": "test_content",
                "description": "test_desc",
                "updated_time": timezone.now(),
                "content_file": test_file,
                "tag_ids": tagid
            }, format='multipart'
        )
        self.assertEqual(resp_post.status_code, status.HTTP_201_CREATED)

        resp_get = self.client.get(content_url_list)
        self.assertEqual(resp_get.status_code, status.HTTP_200_OK)

        tag_url = reverse('tag-detail', args=[tagid])
        rem_post = self.client.delete(tag_url, format='json')
        self.assertEqual(rem_post.status_code, status.HTTP_204_NO_CONTENT)

        content_url = reverse('content-detail', args=[Content.objects.first().pk])
        content_get = self.client.get(content_url)
        js = json.loads(content_get.content.decode('utf-8'))
        self.assertNotIn(tagid, js['tag_ids'])
