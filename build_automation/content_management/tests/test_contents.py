import json
import os
import shutil
import tempfile
from datetime import timedelta
from unittest.mock import MagicMock, patch

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from content_management.exceptions import DuplicateContentFileException
from content_management.models import Content
from content_management.storage import CustomFileStorage

# The directory where the temporary media will be stored in
temp_media_dir = os.path.join(settings.BASE_DIR, 'build_automation/unittest_media_root')


@override_settings(MEDIA_ROOT=temp_media_dir)
class ContentTest(TestCase):
    def setUp(self):
        pass

    def tearDown(self):
        if os.path.exists(temp_media_dir):
            shutil.rmtree(temp_media_dir)

    def test_last_uploaded_time_on_create(self):
        """
        Test whether the last uploaded time is updated correctly, on creating a new model instance.
        """
        currtime = timezone.now()
        updated_time = currtime - timedelta(days=5)
        values = {
            "name": "Content 1",
            "description": "Content's Description",
            "content_file": SimpleUploadedFile(
                "uploaded_file_name", "This will be the contents of the uploaded file.".encode()
            ),
            "updated_time": updated_time,
        }
        content = Content(**values)
        content.content_file_uploaded = True

        mock_timezone_now = MagicMock(return_value=currtime)

        with patch('django.utils.timezone.now', mock_timezone_now):
            content.save()
        content.content_file.close()

        saved_content = Content.objects.first()
        self.assertEqual(mock_timezone_now.call_count, 1)
        self.assertEqual(saved_content.last_uploaded_time, currtime)

    def test_last_uploaded_time_on_update_with_file(self):
        """
        Test whether the last uploaded time is updated correctly, when the file is uploaded on update.
        """
        currtime = timezone.now()
        first_upload_time = currtime - timedelta(days=4)
        updated_time = currtime - timedelta(days=5)
        values = {
            "name": "Content 1",
            "description": "Content's Description",
            "content_file": SimpleUploadedFile(
                "uploaded_file_name", "This will be the contents of the uploaded file.".encode()
            ),
            "updated_time": updated_time,
        }
        content = Content(**values)
        # marks that the file was uploaded during the creation process.
        content.content_file_uploaded = True

        mock_timezone_now = MagicMock(return_value=first_upload_time)

        with patch('django.utils.timezone.now', mock_timezone_now):
            content.save()
        content.content_file.close()

        new_upload_time = currtime - timedelta(days=2)
        mock_timezone_now.return_value = new_upload_time
        with patch('django.utils.timezone.now', mock_timezone_now):
            # content still has content_file_uploaded set to True
            content.save()
        content.content_file.close()

        self.assertEqual(content.last_uploaded_time, new_upload_time)

    def test_last_uploaded_time_on_update_without_file(self):
        """
        Tests whether the last uploaded time is not updated, when there is no file uploaded on update.
        """
        currtime = timezone.now()
        first_upload_time = currtime - timedelta(days=4)
        updated_time = currtime - timedelta(days=5)
        values = {
            "name": "Content 1",
            "description": "Content's Description",
            "content_file": SimpleUploadedFile(
                "uploaded_file_name", "This will be the contents of the uploaded file.".encode()
            ),
            "updated_time": updated_time,
        }
        content = Content(**values)
        # marks that the file was uploaded during the creation process.
        content.content_file_uploaded = True

        mock_timezone_now = MagicMock(return_value=first_upload_time)

        with patch('django.utils.timezone.now', mock_timezone_now):
            content.save()
        content.content_file.close()

        # mark that there is no file uploaded during the update process
        content.content_file_uploaded = False
        new_upload_time = currtime - timedelta(days=2)
        mock_timezone_now.return_value = new_upload_time
        with patch('django.utils.timezone.now', mock_timezone_now):
            content.save()
        content.content_file.close()

        self.assertEqual(content.last_uploaded_time, first_upload_time)

    def test_duplicate_file_on_create(self):
        """
        Tests whether a DuplicateContentFileException is raised, when a duplicate file is uploaded,
        when a new model instance is created
        """
        first_value = {
            "name": "Content 1",
            "description": "Content's Description",
            "content_file": SimpleUploadedFile(
                "uploaded_file_name", "This will be the contents of the uploaded file.".encode()
            ),
            "updated_time": timezone.now()
        }
        content1 = Content(**first_value)
        content1.content_file_uploaded = True
        content1.save()
        content1.content_file.close()

        second_value = {
            "name": "Content 2",
            "description": "Content's Description",
            "content_file": SimpleUploadedFile(
                "uploaded_file_name_2", "This will be the contents of the uploaded file.".encode()
            ),
            "updated_time": timezone.now()
        }
        content2 = Content(**second_value)
        content2.content_file_uploaded = True
        with self.assertRaises(DuplicateContentFileException) as cm:
            content2.save()
        self.assertEqual(cm.exception.content.pk, content1.pk)
        content2.content_file.close()

    def test_delete_content(self):
        """
        Tests whether the file is deleted after the model instance is deleted
        """
        values = {
            "name": "Content 1",
            "description": "Content's Description",
            "content_file": SimpleUploadedFile(
                "uploaded_file_name", "This will be the contents of the uploaded file.".encode()
            ),
            "updated_time": timezone.now()
        }
        content1 = Content(**values)
        content1.content_file_uploaded = True
        content1.save()
        self.assertTrue(os.path.exists(content1.content_file.path))
        content1.delete()
        self.assertFalse(os.path.exists(content1.content_file.path))


@override_settings(MEDIA_ROOT=temp_media_dir, ALLOWED_HOSTS=['testserver'])
class ContentAPITest(APITestCase):
    def test_create_content(self):
        """
        Creating a new piece of content
        """
        url = reverse('content-list')
        with tempfile.NamedTemporaryFile(suffix='.txt') as content_file:
            content_file.write(b"The contents of the temporary file.\n")
            content_file.seek(0)
            data = {
                'name': 'Content File',
                'description': 'File 1',
                'content_file': content_file,
                'updated_time': timezone.now(),
                'creators': [],
                'coverage': '',
                'subjects': [],
                'keywords': [],
                'workareas': [],
                'language': '',
                'cataloger': ''
            }
            response = self.client.post(url, data, format='multipart')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update_content_no_file(self):
        """
        Test updating an existing content without a file
        """
        url = reverse('content-list')
        with tempfile.NamedTemporaryFile(suffix='.txt') as content_file:
            content_file.write(b"The contents of the temporary file.\n")
            content_file.seek(0)
            data = {
                'name': 'Content File',
                'description': 'File 1',
                'content_file': content_file,
                'updated_time': timezone.now(),
                'creators': [],
                'coverage': '',
                'subjects': [],
                'keywords': [],
                'workareas': [],
                'language': '',
                'cataloger': ''
            }
            response = self.client.post(url, data, format='multipart')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Content.objects.count(), 1)
        content = Content.objects.first()
        last_uploaded_time = content.last_uploaded_time
        updated_data = {
            'name': 'Updated Content Name',
            'description': 'New description'
        }
        url = reverse('content-detail', args=[content.pk])
        response = self.client.patch(url, updated_data, format='json')
        content = Content.objects.first()
        self.assertEqual(last_uploaded_time, content.last_uploaded_time)

    def test_update_content_with_file(self):
        """
        Test updating an existing content with a file. The last uploaded time should be updated
        with the to the last request's time
        """
        current_upload_time = timezone.now()
        last_uploaded_time = current_upload_time - timedelta(days=5)
        mock_timezone_now = MagicMock(return_value=last_uploaded_time)
        url = reverse('content-list')
        with tempfile.NamedTemporaryFile(suffix='.txt') as content_file:
            content_file.write(b"The contents of the temporary file.\n")
            content_file.seek(0)
            data = {
                'name': 'Content File',
                'description': 'File 1',
                'content_file': content_file,
                'updated_time': timezone.now(),
                'creators': [],
                'coverage': '',
                'subjects': [],
                'keywords': [],
                'workareas': [],
                'language': '',
                'cataloger': ''
            }

            with patch('django.utils.timezone.now', mock_timezone_now):
                response = self.client.post(url, data, format='multipart')
                self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Content.objects.count(), 1)
        content = Content.objects.first()
        self.assertEqual(content.last_uploaded_time, last_uploaded_time)

        # Update content with new data
        with tempfile.NamedTemporaryFile(suffix='.txt') as content_file:
            content_file.write(b"The contents of the temporary file.\n")
            content_file.seek(0)
            updated_data = {
                'name': 'Updated Content Name',
                'description': 'New description',
                'content_file': content_file,
                'creators': [],
                'coverage': '',
                'subjects': [],
                'keywords': [],
                'workareas': [],
                'language': '',
                'cataloger': ''
            }

            mock_timezone_now.return_value = current_upload_time
            url = reverse('content-detail', args=[content.pk])
            with patch('django.utils.timezone.now', mock_timezone_now):
                response = self.client.patch(url, updated_data, format='multipart')
                self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(Content.objects.count(), 1)
        content = Content.objects.first()
        self.assertEqual(content.last_uploaded_time, current_upload_time)

    def test_upload_duplicate_file_create(self):
        """
        Upload a duplicate file in CREATE operation.
        """
        url = reverse('content-list')
        with tempfile.NamedTemporaryFile(suffix='.txt') as content_file:
            content_file.write(b"The contents of the temporary file.\n")
            content_file.seek(0)
            data = {
                'name': 'Content File',
                'description': 'File 1',
                'content_file': content_file,
                'updated_time': timezone.now(),
                'creators': [],
                'coverage': '',
                'subjects': [],
                'keywords': [],
                'workareas': [],
                'language': '',
                'cataloger': ''
            }
            response = self.client.post(url, data, format='multipart')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Content.objects.count(), 1)
        first_content = Content.objects.first()

        # Duplicate File.
        with tempfile.NamedTemporaryFile(suffix='.txt') as content_file:
            content_file.write(b"The contents of the temporary file.\n")
            content_file.seek(0)
            data = {
                'name': 'Content File',
                'description': 'File 1',
                'content_file': content_file,
                'updated_time': timezone.now(),
                'creators': [],
                'coverage': '',
                'subjects': [],
                'keywords': [],
                'workareas': [],
                'language': '',
                'cataloger': ''
            }
            response = self.client.post(url, data, format='multipart')
            self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
            response_payload = json.loads(response.content.decode("utf-8"))
            self.assertEqual(response_payload['result'], 'error')
            self.assertEqual(response_payload['error'], 'DUPLICATE_FILE_UPLOADED')
            self.assertRegex(
                response_payload['existing_content']['content_url'],
                '%s$' % reverse('content-detail', args=[first_content.pk])
            )
            self.assertRegex(
                response_payload['existing_content']['file_url'],
                '%s$' % first_content.content_file.url
            )

    def test_upload_duplicate_file_upload(self):
        """
        Upload a duplicate file in PATCH operation.
        """
        url = reverse('content-list')
        with tempfile.NamedTemporaryFile(suffix='.txt') as content_file:
            content_file.write(b"The contents of the temporary file.\n")
            content_file.seek(0)
            data = {
                'name': 'Content File',
                'description': 'File 1',
                'content_file': content_file,
                'updated_time': timezone.now(),
                'creators': [],
                'coverage': '',
                'subjects': [],
                'keywords': [],
                'workareas': [],
                'language': '',
                'cataloger': ''
            }
            response = self.client.post(url, data, format='multipart')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Content.objects.count(), 1)
        first_content = Content.objects.first()

        with tempfile.NamedTemporaryFile(suffix='.txt') as content_file:
            content_file.write(b"The contents of the temporary file 2.\n")
            content_file.seek(0)
            data = {
                'name': 'Content File 2',
                'description': 'File 2',
                'content_file': content_file,
                'updated_time': timezone.now(),
                'creators': [],
                'coverage': '',
                'subjects': [],
                'keywords': [],
                'workareas': [],
                'language': '',
                'cataloger': ''
            }
            response = self.client.post(url, data, format='multipart')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Content.objects.count(), 2)
        second_content = Content.objects.filter(name='Content File 2').first()

        # Duplicate File.
        with tempfile.NamedTemporaryFile(suffix='.txt') as content_file:
            content_file.write(b"The contents of the temporary file.\n")
            content_file.seek(0)
            data = {
                'content_file': content_file,
            }

            url = reverse('content-detail', args=[second_content.pk])
            response = self.client.patch(url, data, format='multipart')
            self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
            response_payload = json.loads(response.content.decode("utf-8"))
            self.assertEqual(response_payload['result'], 'error')
            self.assertEqual(response_payload['error'], 'DUPLICATE_FILE_UPLOADED')
            self.assertRegex(
                response_payload['existing_content']['content_url'],
                '%s$' % reverse('content-detail', args=[first_content.pk])
            )
            self.assertRegex(
                response_payload['existing_content']['file_url'],
                '%s$' % first_content.content_file.url
            )


@override_settings(MEDIA_ROOT=temp_media_dir)
class CustomStorageTest(TestCase):
    """
    Tests the Custom Storage Test
    """
    def setUp(self):
        pass

    def tearDown(self):
        if os.path.exists(temp_media_dir):
            shutil.rmtree(temp_media_dir)

    def test_duplicate_file_names(self):
        """
        Tests what happens when another file (different file contents), with the same name as an
        existing file is uploaded to the server.
        """
        first_value = {
            "name": "Content 1",
            "description": "Content's Description",
            "content_file": SimpleUploadedFile(
                "uploaded_file_name", "This will be the contents of the uploaded file 1.".encode()
            ),
            "updated_time": timezone.now()
        }
        content1 = Content(**first_value)
        content1.content_file_uploaded = True
        content1.save()
        content1.content_file.close()

        second_value = {
            "name": "Content 2",
            "description": "Content's Description",
            "content_file": SimpleUploadedFile(
                "uploaded_file_name", "This will be the contents of the uploaded file 2.".encode()
            ),
            "updated_time": timezone.now()
        }
        content2 = Content(**second_value)
        content2.content_file_uploaded = True
        content2.save()
        self.assertEqual(content1.content_file.name, "uploaded_file_name")
        # The following regex is based on CustomFileStorage's get_original_file_name()
        self.assertRegex(
            content2.content_file.name,
            "^uploaded_file_name_%s_[a-zA-Z0-9]{7}$" % settings.FILE_DUPLICATION_MARKER
        )

    def test_get_original_file_name_match_regex(self):
        """
        Test the get_original_file_name() method when it matches the expected regex.
        """
        test_file_name = "uploaded_file_name_%s_abcd123" % settings.FILE_DUPLICATION_MARKER
        expected_file_name = "uploaded_file_name"
        cfs = CustomFileStorage()
        self.assertEqual(cfs.get_original_file_name(test_file_name), expected_file_name)

    def test_get_original_file_name_not_match_regex(self):
        """
        Test the get_original_file_name() method when it does not match the expected regex.
        """
        test_file_name = "uploaded_file_name"
        expected_file_name = "uploaded_file_name"
        cfs = CustomFileStorage()
        self.assertEqual(cfs.get_original_file_name(test_file_name), expected_file_name)
