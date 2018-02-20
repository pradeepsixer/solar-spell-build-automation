import hashlib


class HashUtil:
    """
    Hash Computation Utility
    """

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
