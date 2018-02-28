import os
import shutil
from datetime import timedelta
from unittest.mock import MagicMock, patch

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.utils import timezone

from content_management.models import Content

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

        new_upload_time = currtime - timedelta(days=2)
        mock_timezone_now.return_value = new_upload_time
        with patch('django.utils.timezone.now', mock_timezone_now):
            # content still has content_file_uploaded set to True
            content.save()

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

        # mark that there is no file uploaded during the update process
        content.content_file_uploaded = False
        new_upload_time = currtime - timedelta(days=2)
        mock_timezone_now.return_value = new_upload_time
        with patch('django.utils.timezone.now', mock_timezone_now):
            content.save()

        self.assertEqual(content.last_uploaded_time, first_upload_time)
