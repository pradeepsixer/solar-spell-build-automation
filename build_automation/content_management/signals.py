import os

from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from django.utils import timezone

from .exceptions import DuplicateContentFileException
from .models import Content
from .utils import HashUtil


@receiver(pre_save, sender=Content)
def delete_media_file_on_change(sender, **kwargs):
    """
    Delete Media File from disk when the user uploads a new media file to replace it.
    :param sender: Sender of the signal.
    :param kwargs: `Reference <https://docs.djangoproject.com/en/2.0/ref/signals/#pre-save>`_
    """
    content = kwargs['instance']

    # Only if the new file / replacement file has been uploaded, calculate the hash
    # and replace the old file.
    if content.content_file_uploaded:
        # Calculate the checksum for the uploaded file. If the hash matches any other existing
        # content's checksum, then raise an error.
        newfile_checksum = HashUtil.calc_sha256(content.content_file)
        duplicate_contents = Content.objects.filter(checksum=newfile_checksum)
        if content.checksum != newfile_checksum and duplicate_contents.count() > 0:
            raise DuplicateContentFileException(duplicate_contents.first())
        content.checksum = newfile_checksum  # Assign the new checksum to the model
        content.last_updated_time = timezone.now()  # Assign the current time to the last updated time.

        # If there is a file existing already, remove it, so that only the new file will be stored.
        if content.original_file is not None and content.pk is not None:
            orig_path = content.original_file.path
            if os.path.exists(orig_path):
                os.remove(orig_path)


@receiver(post_delete, sender=Content)
def delete_media_file_after_model_deletion(sender, **kwargs):
    """
    Delete media file from disk when the user deletes the model.
    :param sender: Sender of the signal.
    :param kwargs: `Reference <https://docs.djangoproject.com/en/2.0/ref/signals/#post-delete>`
    """
    content = kwargs['instance']

    if os.path.exists(content.content_file.path):
        os.remove(content.content_file.path)
