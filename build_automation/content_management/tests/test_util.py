import tempfile

from django.test import TestCase

from content_management.utils import HashUtil


class HashUtilTest(TestCase):
    def test_calc_sha256(self):
        """
        Test the SHA-256 calculation for a file.
        """
        with tempfile.TemporaryFile() as input_file:
            input_file.write(b"this is used for the checksum calculation")
            input_file.seek(0)
            # For the above content, the following will the SHA-256 checksum
            expected_checksum = "a03084bae3e363a4bdbe714fa228667987dd4b55c62b323bb72c4813701b19ab"
            return_checksum = HashUtil.calc_sha256(input_file)
            self.assertEqual(return_checksum, expected_checksum)
