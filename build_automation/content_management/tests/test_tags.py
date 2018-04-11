# from django.urls import reverse
# from rest_framework import status
# from rest_framework.test import APITestCase
#
# from content_management.models import (
#     Cataloger, Coverage, Creator, Keyword, Language, Subject, Workarea
# )
#
#
# class CatalogerAPITest(APITestCase):
#     """
#     Test Class for Cataloger Tagging related Rest API.
#     """
#
#     def test_create_tag(self):
#         """
#         Test tags creation API
#         """
#         create_url = reverse('cataloger-list')
#         payload = {
#             'name': 'foo',
#             'description': 'foo description',
#         }
#         response = self.client.post(create_url, payload, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         cataloger = Cataloger.objects.first()
#         self.assertEqual(cataloger.name, payload['name'])
#         self.assertEqual(cataloger.description, payload['description'])
#
#     def test_update_cataloger(self):
#         """
#         Test cataloger updation API
#         """
#         create_url = reverse('cataloger-list')
#         payload = {
#             'name': 'foo',
#             'description': 'foo description',
#             'child_tags': []
#         }
#         response = self.client.post(create_url, payload, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         old_parent_tag = Tag.objects.first()
#
#         payload = {
#             'name': 'bar',
#             'description': 'foo description',
#             'parent': old_parent_tag.id,
#             'child_tags': []
#         }
#         response = self.client.post(create_url, payload, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         child_tag = Tag.objects.last()
#
#         payload = {
#             'name': 'new foo',
#             'description': 'new foo description',
#             'child_tags': []
#         }
#         response = self.client.post(create_url, payload, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         new_parent_tag = Tag.objects.last()
#
#         # Make the old parent tag to be the leaf node.
#
#         payload = {
#             'name': 'updated bar',
#             'description': 'updated description',
#             'parent': new_parent_tag.id,
#             'child_tags': [old_parent_tag.id]
#         }
#         update_url = reverse('tag-detail', args=[child_tag.id])
#         response = self.client.patch(update_url, payload, format='json')
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#
#         leaf_tag = Tag.objects.first()  # The old parent tag
#         child_tag = Tag.objects.get(id=child_tag.id)
#         new_parent_tag = Tag.objects.last()
#
#         self.assertEqual(child_tag.name, payload['name'])
#         self.assertEqual(child_tag.description, payload['description'])
#         self.assertEqual([child.id for child in new_parent_tag.child_tags.all()], [child_tag.id])
#         self.assertEqual([child.id for child in child_tag.child_tags.all()], [leaf_tag.id])
#
#     def test_delete_tag(self):
#         """
#         Test tag deletion. Tests whether deleting the parent tag deletes the child tags
#         also.
#         """
#         create_url = reverse('tag-list')
#         payload = {
#             'name': 'foo 1',
#             'description': 'foo description',
#             'child_tags': []
#         }
#         response = self.client.post(create_url, payload, format='json')
#         child_tag = Tag.objects.first()
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#
#         payload = {
#             'name': 'foo 2',
#             'description': 'foo 2 description',
#             'child_tags': [child_tag.id]
#         }
#         response = self.client.post(create_url, payload, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         parent_tag = Tag.objects.last()
#
#         delete_url = reverse('tag-detail', args=[parent_tag.pk])
#         response = self.client.delete(delete_url)
#         self.assertEqual(Tag.objects.all().count(), 0)
