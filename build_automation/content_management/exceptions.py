class DuplicateContentFileException(Exception):
    """
    This exception should be risen when the client uploads a duplicate content to the server.
    """

    def __init__(self, duplicate_content, message=None):
        self.content = duplicate_content
        self.message = message
        if message is None:
            self.message = "This file already exists for Content %d %s" % (
                                duplicate_content.pk, duplicate_content.name
                            )
