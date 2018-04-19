import hashlib
import os


class HashUtil:
    """
    Hash Computation Utility
    """

    @staticmethod
    def calc_sha256(input_file):
        """
        Calculate the SHA-256 checksum for the given file object.
        :param input_file: Input file for which the SHA-256 should be calculated.
        """
        sha256_ctxt = hashlib.sha256()
        bytes_data = input_file.read(4096)
        while bytes_data != b"":
            sha256_ctxt.update(bytes_data)
            bytes_data = input_file.read(4096)
        input_file.seek(0)
        return sha256_ctxt.hexdigest()


class DiskSpace:
    disk_stats = os.statvfs('/')
    block_size = disk_stats.f_frsize
    avail_blocks = disk_stats.f_bavail
    total_blocks = disk_stats.f_blocks

    def getfreespace(self):
        free_space = self.block_size * self.avail_blocks
        total_space = self.total_blocks * self.block_size
        return (free_space, total_space)
