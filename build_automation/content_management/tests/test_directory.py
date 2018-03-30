from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from content_management.models import Directory as Directorymodel
from content_management.models import DirectoryLayout as DirectoryLayoutmodel
from content_management.models import FilterCriteria as FilterCriteriamodel
from content_management.models import Tag as Tagmodel


class Directory(APITestCase):
    def test_create(self):
        # directory layout creation
        dir_layout_url = reverse('directorylayout-list')
        dir_layout_post = self.client.post(
            dir_layout_url, {
                 "name": "Layout 1",
                 "description": "Layout description"
            }, format='json'
        )
        self.assertEqual(dir_layout_post.status_code, status.HTTP_201_CREATED)
        dir_layout_id = DirectoryLayoutmodel.objects.first().pk

        # tags creation
        tag_url = reverse('tag-list')
        tag_post = self.client.post(tag_url, {
            "name": "test_tag_1",
            "description": "test_description",
            "child_tags": []}, format='json'
        )
        self.assertEqual(tag_post.status_code, status.HTTP_201_CREATED)
        tag_post = self.client.post(tag_url, {
            "name": "test_tag_2",
            "description": "test_description",
            "child_tags": []}, format='json'
        )
        self.assertEqual(tag_post.status_code, status.HTTP_201_CREATED)
        tag_post = self.client.post(tag_url, {
            "name": "test_tag_3",
            "description": "test_description",
            "child_tags": []}, format='json'
        )
        self.assertEqual(tag_post.status_code, status.HTTP_201_CREATED)
        tag_id1 = Tagmodel.objects.get(name="test_tag_1").pk
        tag_id2 = Tagmodel.objects.get(name="test_tag_2").pk
        tag_id3 = Tagmodel.objects.get(name="test_tag_3").pk
        filter_criteria_exp = "((%d AND %d) OR %d)" % (
            tag_id1, tag_id2, tag_id3
        )

        # create directory
        directory_url = reverse('directory-list')
        directory_post = self.client.post(
            directory_url, {
                "name": "directory 1",
                "dir_layout": dir_layout_id,
                "filter_criteria": filter_criteria_exp,
                "parent": None
            }, format='json'
        )
        self.assertEqual(directory_post.status_code, status.HTTP_201_CREATED)

        directory_get = self.client.get(directory_url)
        self.assertEqual(directory_get.status_code, status.HTTP_200_OK)
        self.assertEqual(directory_get.data[0]['name'], Directorymodel.objects.first().name)
        self.assertEqual(directory_get.data[0]['dir_layout'], Directorymodel.objects.first().dir_layout.pk)
        self.assertEqual(directory_get.data[0]['filter_criteria'], filter_criteria_exp)
        self.assertEqual(directory_get.data[0]['parent'], Directorymodel.objects.first().parent)

    def test_update(self):
        # directory layout creation
        dir_layout_url = reverse('directorylayout-list')
        dir_layout_post = self.client.post(
            dir_layout_url, {
                 "name": "Layout 1",
                 "description": "Layout description"
            }, format='json'
        )
        self.assertEqual(dir_layout_post.status_code, status.HTTP_201_CREATED)
        dir_layout_id = DirectoryLayoutmodel.objects.first().pk

        dir_layout_post = self.client.post(
            dir_layout_url, {
                 "name": "Layout 2",
                 "description": "Layout description"
            }, format='json'
        )
        self.assertEqual(dir_layout_post.status_code, status.HTTP_201_CREATED)
        dir_layout_id2 = DirectoryLayoutmodel.objects.get(name="Layout 2").pk

        # tags creation
        tag_url = reverse('tag-list')
        tag_post = self.client.post(tag_url, {
            "name": "test_tag_1",
            "description": "test_description",
            "child_tags": []}, format='json'
        )
        self.assertEqual(tag_post.status_code, status.HTTP_201_CREATED)
        tag_post = self.client.post(tag_url, {
            "name": "test_tag_2",
            "description": "test_description",
            "child_tags": []}, format='json'
        )
        self.assertEqual(tag_post.status_code, status.HTTP_201_CREATED)
        tag_post = self.client.post(tag_url, {
            "name": "test_tag_3",
            "description": "test_description",
            "child_tags": []}, format='json'
        )
        self.assertEqual(tag_post.status_code, status.HTTP_201_CREATED)
        tag_id1 = Tagmodel.objects.get(name="test_tag_1").pk
        tag_id2 = Tagmodel.objects.get(name="test_tag_2").pk
        tag_id3 = Tagmodel.objects.get(name="test_tag_3").pk
        filter_criteria_exp = "((%d AND %d) OR %d)" % (
            tag_id1, tag_id2, tag_id3
        )
        filter_criteria_exp_updated = "((%d OR %d) AND %d)" % (
            tag_id1, tag_id2, tag_id3
        )

        # Update a single attribute of directory
        directory_url = reverse('directory-list')
        directory_post = self.client.post(
            directory_url, {
                "name": "directory 1",
                "dir_layout": dir_layout_id,
                "filter_criteria": filter_criteria_exp,
                "parent": None
            }, format='json'
        )
        self.assertEqual(directory_post.status_code, status.HTTP_201_CREATED)

        directory_update_url = reverse('directory-detail', args=[Directorymodel.objects.first().pk])
        directory_update = self.client.patch(
            directory_update_url, {
                "name": "directory 1 updated"
            }, format='json'
        )
        self.assertEqual(directory_update.status_code, status.HTTP_200_OK)

        directory_get = self.client.get(directory_url)
        self.assertEqual(directory_get.status_code, status.HTTP_200_OK)
        self.assertEqual(directory_get.data[0]['name'], Directorymodel.objects.first().name)

        # Update every field
        directory_update_url = reverse('directory-detail', args=[Directorymodel.objects.first().pk])
        directory_update = self.client.put(
            directory_update_url, {
                "name": "directory 2",
                "dir_layout": dir_layout_id2,
                "filter_criteria": filter_criteria_exp_updated,
                "parent": None
            }, format='json'
        )
        self.assertEqual(directory_update.status_code, status.HTTP_200_OK)

        directory_get = self.client.get(directory_url)
        self.assertEqual(directory_get.status_code, status.HTTP_200_OK)
        self.assertEqual(directory_get.data[0]['name'], Directorymodel.objects.first().name)
        self.assertEqual(directory_get.data[0]['dir_layout'], Directorymodel.objects.first().dir_layout.pk)
        self.assertEqual(directory_get.data[0]['filter_criteria'], filter_criteria_exp_updated)
        self.assertEqual(directory_get.data[0]['parent'], Directorymodel.objects.first().parent)

    def test_delete(self):
        # directory layout creation
        dir_layout_url = reverse('directorylayout-list')
        dir_layout_post = self.client.post(
            dir_layout_url, {
                 "name": "Layout 1",
                 "description": "Layout description"
            }, format='json'
        )
        self.assertEqual(dir_layout_post.status_code, status.HTTP_201_CREATED)
        dir_layout_id = DirectoryLayoutmodel.objects.first().pk

        # tags creation
        tag_url = reverse('tag-list')
        tag_post = self.client.post(tag_url, {
            "name": "test_tag_1",
            "description": "test_description",
            "child_tags": []}, format='json'
        )
        self.assertEqual(tag_post.status_code, status.HTTP_201_CREATED)
        tag_post = self.client.post(tag_url, {
            "name": "test_tag_2",
            "description": "test_description",
            "child_tags": []}, format='json'
        )
        self.assertEqual(tag_post.status_code, status.HTTP_201_CREATED)
        tag_post = self.client.post(tag_url, {
            "name": "test_tag_3",
            "description": "test_description",
            "child_tags": []}, format='json'
        )
        self.assertEqual(tag_post.status_code, status.HTTP_201_CREATED)
        tag_id1 = Tagmodel.objects.get(name="test_tag_1").pk
        tag_id2 = Tagmodel.objects.get(name="test_tag_2").pk
        tag_id3 = Tagmodel.objects.get(name="test_tag_3").pk
        filter_criteria_exp = "((%d AND %d) OR %d)" % (
            tag_id1, tag_id2, tag_id3
        )

        # directory creation
        directory_url = reverse('directory-list')
        directory_post = self.client.post(
            directory_url, {
                "name": "directory",
                "dir_layout": dir_layout_id,
                "filter_criteria": filter_criteria_exp,
                "parent": None
            }, format='json'
        )
        self.assertEqual(directory_post.status_code, status.HTTP_201_CREATED)

        # creating child directory
        filter_criteria_exp_updated = "((%d OR %d) AND %d)" % (
            tag_id1, tag_id2, tag_id3
        )
        directory_post = self.client.post(
            directory_url, {
                "name": "directory child",
                "dir_layout": dir_layout_id,
                "filter_criteria": filter_criteria_exp_updated,
                "parent": Directorymodel.objects.first().pk
            }, format='json'
        )
        self.assertEqual(directory_post.status_code, status.HTTP_201_CREATED)

        created_filter_criteria = Directorymodel.objects.last().filter_criteria

        # delete child directory
        directory_url = reverse('directory-detail', args=[Directorymodel.objects.get(name="directory child").pk])
        directory_delete = self.client.delete(directory_url, format='json')
        self.assertEqual(directory_delete.status_code, status.HTTP_204_NO_CONTENT)

        # check if child directory is deleted
        self.assertEqual(Directorymodel.objects.get(name="directory"), Directorymodel.objects.last())

        # check if parent directory and its attributes including directory layout exist
        directory_url = reverse('directory-list')
        directory_get = self.client.get(directory_url)
        self.assertEqual(directory_get.status_code, status.HTTP_200_OK)
        self.assertEqual(directory_get.data[0]['name'], Directorymodel.objects.first().name)
        self.assertEqual(directory_get.data[0]['dir_layout'], Directorymodel.objects.first().dir_layout.pk)
        self.assertEqual(directory_get.data[0]['filter_criteria'], filter_criteria_exp)
        self.assertEqual(directory_get.data[0]['parent'], Directorymodel.objects.first().parent)

        # check if FilterCriteria is deleted
        for i in FilterCriteriamodel.objects.all():
            if(str(i) == str(created_filter_criteria)):
                assert False, "Filter criteria not deleted"
            else:
                assert True
