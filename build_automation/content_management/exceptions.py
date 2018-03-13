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


class MalformedExpression(Exception):
    """
    Raised when the expression is malformed for creating the FilterCriteria
    """

    def __init__(self, expression, message=None):
        self.expression = expression
        self.message = message
        if message is None:
            self.message = "The given expression %s is malformed." % expression


class InvalidOperatorException(Exception):
    """
    Raised when there is an invalid operator in the expression provided.
    """

    def __init__(self, operator, message=None):
        self.operator = operator
        self.message = message
        if message is None:
            self.message = "An Invalid operator %s is encountered." % operator
