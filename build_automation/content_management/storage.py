import os
import re

from django.conf import settings
from django.core.exceptions import SuspiciousFileOperation
from django.core.files.storage import FileSystemStorage
from django.utils.crypto import get_random_string


class CustomFileStorage(FileSystemStorage):
    """
    This is used only not to process the file name like what django's FileSystemStorage does.
    For more info, visit Django's reference page for writing `Custom Storage Engines
    <https://docs.djangoproject.com/en/2.0/howto/custom-file-storage/#django.core.files.storage.get_valid_name>`_.
    """

    RANDOM_STRING_LEN = 7

    def get_valid_name(self, name):
        """
        Do not process the file name. Just return it as it is.
        """
        return name

    def get_available_name(self, name, max_length=None):
        """
        Copied from https://github.com/django/django/blob/master/django/core/files/storage.py .
        Added a file duplication marker for the purpose of getting the original file name later.
        ..warning:: If this is changed, so should be the get_original_file_name's implementation.
        """
        dir_name, file_name = os.path.split(name)
        file_root, file_ext = os.path.splitext(file_name)
        file_duplication_marker = settings.FILE_DUPLICATION_MARKER

        # If the filename already exists, the following is done to get a unique filename:
        # 1. Add a duplicate marker (this shows that there was file name duplication).
        #       Append it to original filename.
        # 2. Generate a random string of length RANDOM_STRING_LEN, and append it.
        # Repeat the random string generation, until a unique name is achieved.
        # Truncate original name if required, so the new filename does not
        # exceed the max_length.
        while self.exists(name) or (max_length and len(name) > max_length):
            # file_ext includes the dot.
            name = os.path.join(dir_name, "%s_%s_%s%s" % (
                file_root, file_duplication_marker, get_random_string(self.RANDOM_STRING_LEN), file_ext)
            )
            if max_length is None:
                continue
            # Truncate file_root if max_length exceeded.
            truncation = len(name) - max_length
            if truncation > 0:
                file_root = file_root[:-truncation]
                # Entire file_root was truncated in attempt to find an available filename.
                if not file_root:
                    raise SuspiciousFileOperation(
                        'Storage can not find an available filename for "%s". '
                        'Please make sure that the corresponding file field '
                        'allows sufficient "max_length".' % name
                    )
                name = os.path.join(dir_name, "%s_%s_%s%s" % (
                    file_root, file_duplication_marker, get_random_string(self.RANDOM_STRING_LEN), file_ext)
                )
        return name

    def get_original_file_name(self, name):
        """
        Get the original file name from the given name, by removing the string generated for making the
        file name unique on the media root.
        ..warning:: This depends on CustomFileStorage.get_available_name() for how the unique name is generated.
        """
        dir_name, file_name = os.path.split(name)
        file_root, file_ext = os.path.splitext(file_name)
        file_duplication_marker = settings.FILE_DUPLICATION_MARKER

        if re.search('_%s_[a-zA-Z0-9]{%d}$' % (file_duplication_marker, self.RANDOM_STRING_LEN), file_root):
            # The length of duplication marker followed by a string of length RANDOM_STRING_LEN
            # made of random characters.
            suffix_len = len('_%s_' % file_duplication_marker) + self.RANDOM_STRING_LEN
            original_file_root = file_root[0: len(file_root) - suffix_len]
            name = os.path.join(dir_name, "%s%s" % (original_file_root, file_ext))
        return name
