import os
import shutil
from datetime import date

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from content_management.models import (
    Cataloger, Content, Coverage, Creator, Directory, DirectoryLayout, Keyword, Language, Subject, Workarea
)

temp_media_dir = os.path.join(settings.BASE_DIR, 'build_automation/unittest_media_root')


@override_settings(MEDIA_ROOT=temp_media_dir)
class LibraryVersionTestCase(APITestCase):
    """
    Test Cases for Library Versions (a.k.a DirectoryLayout in models)
    """

    LIST_URL = reverse("directorylayout-list")
    DETAIL_URL_NAME = "directorylayout-detail"

    def setUp(self):
        self.payload = {
            "name": "foo",
            "description": "bar",
            "banner_file": SimpleUploadedFile(
                "sample_banner_file", "These are the contents of the banner file".encode()
            )
        }

    def tearDown(self):
        if os.path.exists(temp_media_dir):
            shutil.rmtree(temp_media_dir)

    def __create_sample_library_version(self):
        response = self.client.post(self.LIST_URL, self.payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return response.data

    def test_create(self):
        """
        Test Library Version Creation.
        """
        self.__create_sample_library_version()
        response = self.client.get(self.LIST_URL)
        # json_dump = json.loads(response)
        returned_library_version = response.data[0]
        self.assertEqual(returned_library_version['name'], self.payload['name'])
        self.assertEqual(returned_library_version['description'], self.payload['description'])
        self.assertRegex(returned_library_version['banner_file'], r"/{}$".format(self.payload['banner_file'].name))

    def test_update_with_banner(self):
        """
        Test Library Version updation with a new banner
        """
        initial_value = self.__create_sample_library_version()
        update_payload = {
            "name": "updated foo",
            "description": "updated bar",
            "banner_file": SimpleUploadedFile(
                "updated_banner_file", "Updated Banner File".encode()
            )
        }
        target_url = reverse(self.DETAIL_URL_NAME, args=[initial_value['id']])
        response = self.client.patch(target_url, update_payload, format='multipart')
        returned_library_version = response.data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(returned_library_version['name'], update_payload['name'])
        self.assertEqual(returned_library_version['description'], update_payload['description'])
        self.assertRegex(
            returned_library_version['banner_file'],
            r"/{}$".format(update_payload['banner_file'].name)
        )

    def test_update_without_banner(self):
        """
        Test Library Version updation without a new banner
        """
        initial_value = self.__create_sample_library_version()
        update_payload = {
            "name": "updated foo",
            "description": "updated bar",
        }
        target_url = reverse(self.DETAIL_URL_NAME, args=[initial_value['id']])
        response = self.client.patch(target_url, update_payload, format='multipart')
        returned_library_version = response.data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(returned_library_version['name'], update_payload['name'])
        self.assertEqual(returned_library_version['description'], update_payload['description'])
        self.assertRegex(
            returned_library_version['banner_file'],
            r"/{}$".format(self.payload['banner_file'].name)
        )

    def test_delete(self):
        """
        Test Library Version Deletion
        """
        initial_value = self.__create_sample_library_version()
        target_url = reverse(self.DETAIL_URL_NAME, args=[initial_value['id']])
        response = self.client.delete(target_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


@override_settings(MEDIA_ROOT=temp_media_dir)
class DirectoryTestCase(APITestCase):
    """
    Test Cases for Directories (a.k.a Folders)
    """
    def setUp(self):
        self.dir_layout = DirectoryLayout.objects.create(
            name="foo", description="bar",
            banner_file=SimpleUploadedFile("sample_file", "File Contents".encode())
        )
        self.coverages = Coverage.objects.bulk_create([
            Coverage(name="cov1", description="desc cov1"),
            Coverage(name="cov2", description="desc cov2"),
            Coverage(name="cov3", description="desc cov3"),
        ])
        self.creators = Creator.objects.bulk_create([
            Creator(name="Creator 1", description="desc Creator 1"),
            Creator(name="Creator 2", description="desc Creator 2"),
            Creator(name="Creator 3", description="desc Creator 3"),
        ])
        self.subjects = Subject.objects.bulk_create([
            Subject(name="subject 1", description="desc subject 1"),
            Subject(name="subject 2", description="desc subject 2"),
            Subject(name="subject 3", description="desc subject 3"),
        ])
        self.keywords = Keyword.objects.bulk_create([
            Keyword(name="keyword 1", description="desc keyword 1"),
            Keyword(name="keyword 2", description="desc keyword 2"),
            Keyword(name="keyword 3", description="desc keyword 3"),
        ])
        self.workareas = Workarea.objects.bulk_create([
            Workarea(name="workarea 1", description="desc workarea 1"),
            Workarea(name="workarea 2", description="desc workarea 2"),
            Workarea(name="workarea 3", description="desc workarea 3"),
        ])
        self.languages = Language.objects.bulk_create([
            Language(name="language 1", description="desc language 1"),
            Language(name="language 2", description="desc language 2"),
            Language(name="language 3", description="desc language 3"),
        ])
        self.catalogers = Cataloger.objects.bulk_create([
            Cataloger(name="cataloger 1", description="desc cataloger 1"),
            Cataloger(name="cataloger 2", description="desc cataloger 2"),
            Cataloger(name="cataloger 3", description="desc cataloger 3"),
        ])
        content_1 = Content(
            name="content file 1", description="content file 1 desc",
            content_file=SimpleUploadedFile(
                "file_1", "Contents of file 1".encode()
            ),
            updated_time=date.today()
        )
        content_1.content_file_uploaded = True
        content_1.save()
        content_2 = Content(
            name="content file 2", description="content file 2 desc",
            content_file=SimpleUploadedFile(
                "file_2", "Contents of file 2".encode()
            ),
            updated_time=date.today()
        )
        content_2.content_file_uploaded = True
        content_2.save()
        self.contents = [content_1, content_2]

    def tearDown(self):
        if os.path.exists(temp_media_dir):
            shutil.rmtree(temp_media_dir)

    def __create_directory(self, name="directory", parent='', upload_file_name=None):
        payload = {
            'name': name,
            'dir_layout': self.dir_layout.id,
            'parent': parent,
            'individual_files': [self.contents[0].id],
            'coverages': [self.coverages[0].id, self.coverages[1].id],
            'creators': [self.creators[0].id, self.creators[1].id],
            'subjects': [self.subjects[0].id, self.subjects[1].id],
            'keywords': [self.keywords[0].id, self.keywords[1].id],
            'workareas': [self.workareas[0].id, self.workareas[1].id],
            'languages': [self.languages[0].id, self.languages[1].id],
            'catalogers': [self.catalogers[0].id, self.catalogers[1].id],
            'creators_need_all': True,
            'coverages_need_all': True,
            'subjects_need_all': True,
            'keywords_need_all': True,
            'workareas_need_all': True,
            'languages_need_all': True,
            'catalogers_need_all': True,
        }
        if upload_file_name is not None:
            payload['banner_file'] = SimpleUploadedFile(upload_file_name, "Content of Dir Banner".encode())

        target_url = reverse("directory-list")
        response = self.client.post(target_url, payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return (payload, response.data)

    def test_create_directory(self):
        (payload, response_data) = self.__create_directory(name="dir 1", upload_file_name="banner_1")
        dir_name = 'dir 2'
        self.assertRegex(response_data['banner_file'], r"/{}$".format(payload['banner_file'].name))
        parent_id = response_data['id']
        (payload, response_data) = self.__create_directory(name=dir_name, parent=parent_id)
        self.assertEqual(response_data['name'], dir_name)
        self.assertEqual(response_data['dir_layout'], payload['dir_layout'])
        self.assertEqual(response_data['parent'], parent_id)
        self.assertEqual(response_data['individual_files'], payload['individual_files'])
        self.assertEqual(response_data['coverages'], payload['coverages'])
        self.assertEqual(response_data['creators'], payload['creators'])
        self.assertEqual(response_data['subjects'], payload['subjects'])
        self.assertEqual(response_data['keywords'], payload['keywords'])
        self.assertEqual(response_data['workareas'], payload['workareas'])
        self.assertEqual(response_data['languages'], payload['languages'])
        self.assertEqual(response_data['catalogers'], payload['catalogers'])
        self.assertEqual(response_data['creators_need_all'], payload['creators_need_all'])
        self.assertEqual(response_data['coverages_need_all'], payload['coverages_need_all'])
        self.assertEqual(response_data['subjects_need_all'], payload['subjects_need_all'])
        self.assertEqual(response_data['keywords_need_all'], payload['keywords_need_all'])
        self.assertEqual(response_data['workareas_need_all'], payload['workareas_need_all'])
        self.assertEqual(response_data['languages_need_all'], payload['languages_need_all'])
        self.assertEqual(response_data['catalogers_need_all'], payload['catalogers_need_all'])
        self.assertIsNone(response_data['banner_file'])

    def test_update_directory(self):
        (payload, response_data) = self.__create_directory(name="dir 1", upload_file_name="banner_1")
        parent_id = response_data['id']
        (payload, response_data) = self.__create_directory(name="dir 2", upload_file_name="banner_2")
        banner_file_name = payload['banner_file'].name
        dir_name = 'updated dir name'
        update_payload = {
            'name': dir_name,
            'dir_layout': self.dir_layout.id,
            'parent': parent_id,
            'individual_files': [self.contents[1].id],
            'coverages': [self.coverages[2].id],
            'creators': [self.creators[2].id],
            'subjects': [self.subjects[2].id],
            'keywords': [self.keywords[2].id],
            'workareas': [self.workareas[2].id],
            'languages': [self.languages[2].id],
            'catalogers': [self.catalogers[2].id],
            'creators_need_all': True,
            'coverages_need_all': False,
            'subjects_need_all': True,
            'keywords_need_all': True,
            'workareas_need_all': False,
            'languages_need_all': True,
            'catalogers_need_all': True,
        }
        target_url = reverse("directory-detail", args=[response_data['id']])
        response = self.client.patch(target_url, update_payload, format="multipart")
        response_data = response.data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response_data['name'], dir_name)
        self.assertEqual(response_data['dir_layout'], update_payload['dir_layout'])
        self.assertEqual(response_data['parent'], parent_id)
        self.assertEqual(response_data['individual_files'], update_payload['individual_files'])
        self.assertEqual(response_data['coverages'], update_payload['coverages'])
        self.assertEqual(response_data['creators'], update_payload['creators'])
        self.assertEqual(response_data['subjects'], update_payload['subjects'])
        self.assertEqual(response_data['keywords'], update_payload['keywords'])
        self.assertEqual(response_data['workareas'], update_payload['workareas'])
        self.assertEqual(response_data['languages'], update_payload['languages'])
        self.assertEqual(response_data['catalogers'], update_payload['catalogers'])
        self.assertEqual(response_data['creators_need_all'], update_payload['creators_need_all'])
        self.assertEqual(response_data['coverages_need_all'], update_payload['coverages_need_all'])
        self.assertEqual(response_data['subjects_need_all'], update_payload['subjects_need_all'])
        self.assertEqual(response_data['keywords_need_all'], update_payload['keywords_need_all'])
        self.assertEqual(response_data['workareas_need_all'], update_payload['workareas_need_all'])
        self.assertEqual(response_data['languages_need_all'], update_payload['languages_need_all'])
        self.assertEqual(response_data['catalogers_need_all'], update_payload['catalogers_need_all'])
        self.assertRegex(response_data['banner_file'], r"/{}$".format(banner_file_name))

    def test_delete_directory(self):
        (payload, response_data) = self.__create_directory(name="dir 1", upload_file_name="banner_1")
        parent_id = response_data['id']
        (payload, response_data) = self.__create_directory(name="dir 2", parent=parent_id, upload_file_name="banner_2")

        target_url = reverse("directory-detail", args=[parent_id])
        response = self.client.delete(target_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Directory.objects.count(), 0)


@override_settings(MEDIA_ROOT=temp_media_dir)
class DirectoryLayoutClone(APITestCase):
    """
    Test the Library Version cloning.
    """
    def setUp(self):
        self.dir_layout = DirectoryLayout.objects.create(
            name="foo", description="bar",
            banner_file=SimpleUploadedFile("sample_file", "File Contents".encode())
        )
        self.coverages = Coverage.objects.bulk_create([
            Coverage(name="cov1", description="desc cov1"),
            Coverage(name="cov2", description="desc cov2"),
            Coverage(name="cov3", description="desc cov3"),
        ])
        self.creators = Creator.objects.bulk_create([
            Creator(name="Creator 1", description="desc Creator 1"),
            Creator(name="Creator 2", description="desc Creator 2"),
            Creator(name="Creator 3", description="desc Creator 3"),
        ])
        self.subjects = Subject.objects.bulk_create([
            Subject(name="subject 1", description="desc subject 1"),
            Subject(name="subject 2", description="desc subject 2"),
            Subject(name="subject 3", description="desc subject 3"),
        ])
        self.keywords = Keyword.objects.bulk_create([
            Keyword(name="keyword 1", description="desc keyword 1"),
            Keyword(name="keyword 2", description="desc keyword 2"),
            Keyword(name="keyword 3", description="desc keyword 3"),
        ])
        self.workareas = Workarea.objects.bulk_create([
            Workarea(name="workarea 1", description="desc workarea 1"),
            Workarea(name="workarea 2", description="desc workarea 2"),
            Workarea(name="workarea 3", description="desc workarea 3"),
        ])
        self.languages = Language.objects.bulk_create([
            Language(name="language 1", description="desc language 1"),
            Language(name="language 2", description="desc language 2"),
            Language(name="language 3", description="desc language 3"),
        ])
        self.catalogers = Cataloger.objects.bulk_create([
            Cataloger(name="cataloger 1", description="desc cataloger 1"),
            Cataloger(name="cataloger 2", description="desc cataloger 2"),
            Cataloger(name="cataloger 3", description="desc cataloger 3"),
        ])
        content_1 = Content(
            name="content file 1", description="content file 1 desc",
            content_file=SimpleUploadedFile(
                "file_1", "Contents of file 1".encode()
            ),
            updated_time=date.today()
        )
        content_1.content_file_uploaded = True
        content_1.save()
        content_2 = Content(
            name="content file 2", description="content file 2 desc",
            content_file=SimpleUploadedFile(
                "file_2", "Contents of file 2".encode()
            ),
            updated_time=date.today()
        )
        content_2.content_file_uploaded = True
        content_2.save()
        self.contents = [content_1, content_2]

        dir_1 = Directory(
            name="parent dir 1", dir_layout=self.dir_layout,
            banner_file=SimpleUploadedFile("top_dir1_banner_file", "dir 1 banner file content".encode()),
            creators_need_all=True, coverages_need_all=True,
            subjects_need_all=True, keywords_need_all=True, workareas_need_all=True,
            languages_need_all=True, catalogers_need_all=True,
        )
        dir_1.save()
        dir_1.individual_files.set([content_1])
        dir_1.coverages.set([self.coverages[0]])
        dir_1.creators.set([self.creators[0]])
        dir_1.subjects.set([self.subjects[0]])
        dir_1.keywords.set([self.keywords[0]])
        dir_1.workareas.set([self.workareas[0]])
        dir_1.languages.set([self.languages[0]])
        dir_1.catalogers.set([self.catalogers[0]])
        dir_2 = Directory(
            name="parent dir 2", dir_layout=self.dir_layout,
            banner_file=SimpleUploadedFile("top_dir2_banner_file", "dir 2 banner file content".encode()),
            creators_need_all=True, coverages_need_all=True,
            subjects_need_all=False, keywords_need_all=True, workareas_need_all=False,
            languages_need_all=True, catalogers_need_all=True,
        )
        dir_2.save()
        dir_2.individual_files.set([content_1, content_2])
        dir_2.coverages.set([self.coverages[1]])
        dir_2.creators.set([self.creators[1]])
        dir_2.subjects.set([self.subjects[1]])
        dir_2.keywords.set([self.keywords[1]])
        dir_2.workareas.set([self.workareas[1]])
        dir_2.languages.set([self.languages[1]])
        dir_2.catalogers.set([self.catalogers[0]])
        dir_3 = Directory(
            name="child dir", dir_layout=self.dir_layout,
            banner_file=SimpleUploadedFile("child_banner_file", "dir 3 banner file content".encode()),
            creators_need_all=True, coverages_need_all=False,
            subjects_need_all=True, keywords_need_all=True, workareas_need_all=True,
            languages_need_all=False, catalogers_need_all=False,
        )
        dir_3.save()
        dir_3.individual_files.set([content_2])
        dir_3.coverages.set([self.coverages[0], self.coverages[1]])
        dir_3.creators.set([self.creators[0], self.creators[1]])
        dir_3.subjects.set([self.subjects[0], self.subjects[1]])
        dir_3.keywords.set([self.keywords[0], self.keywords[1]])
        dir_3.workareas.set([self.workareas[0], self.workareas[1]])
        dir_3.languages.set([self.languages[0], self.languages[1]])
        dir_3.catalogers.set([self.catalogers[0], self.catalogers[1]])

        dir_4 = Directory(
            name="inner child dir", dir_layout=self.dir_layout,
            banner_file=SimpleUploadedFile("inner_child_banner_file", "dir 4 banner file content".encode()),
            creators_need_all=False, coverages_need_all=True,
            subjects_need_all=True, keywords_need_all=False, workareas_need_all=False,
            languages_need_all=False, catalogers_need_all=True,
        )
        dir_4.save()
        self.directories = [dir_1, dir_2, dir_3, dir_4]

    def test_directory_layout_clone(self):
        target_url = reverse("dirlayout-clone", args=[self.dir_layout.id])
        response = self.client.post(target_url)
        response_data = response.data
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response_data['name'], "{}_clone".format(self.dir_layout.name))
        self.assertEqual(response_data['description'], self.dir_layout.description)
        # TODO: Improve on this test case. Does not walk down the tree to check whether everything has been perfectly
        # cloned or not.

    def test_directory_layout_clone_duplicate(self):
        target_url = reverse("dirlayout-clone", args=[self.dir_layout.id])
        cloned_layout = self.client.post(target_url).data
        response = self.client.post(target_url)
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data['error'], 'DIRECTORY_LAYOUT_ALREADY_EXISTS')
        self.assertEqual(response.data['existing_directory_layout']['directory_layout_name'], cloned_layout['name'])
        self.assertEqual(response.data['existing_directory_layout']['directory_layout'], cloned_layout['url'])
