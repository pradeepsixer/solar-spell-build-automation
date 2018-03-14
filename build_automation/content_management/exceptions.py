class BaseException(Exception):
    def __init__(self, default_message, custom_message=None):
        self.message = custom_message
        if custom_message is None:
            self.message = default_message

    def __str__(self):
        return self.message


class DuplicateContentFileException(BaseException):
    """
    This exception should be risen when the client uploads a duplicate content to the server.
    """

    def __init__(self, duplicate_content, message=None):
        super().__init__(
            "This file already exists for Content %d %s" % (
                duplicate_content.pk, duplicate_content.name
            ), message
        )
        self.content = duplicate_content


class MalformedExpressionException(BaseException):
    """
    Raised when the expression is malformed for creating the FilterCriteria
    """

    def __init__(self, expression, message=None):
        super().__init__("The given expression %s is malformed." % expression, message)
        self.expression = expression


class InvalidOperatorException(BaseException):
    """
    Raised when there is an invalid operator in the expression provided.
    """

    def __init__(self, operator, message=None):
        super().__init__("An invalid operator %s is encountered." % operator, message)
        self.operator = operator
