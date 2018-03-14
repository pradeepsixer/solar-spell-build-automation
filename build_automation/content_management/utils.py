import hashlib
import re

from django.db import transaction

from content_management.exceptions import MalformedExpressionException
from content_management.models import FilterCriteria, Tag


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


class FilterCriteriaUtil:
    """
    A utility related to content_management.models.FilterCriteria
    """
    TOKEN_OPEN_PARENTHESIS = '('
    TOKEN_CLOSE_PARENTHESIS = ')'
    TOKEN_OR = 'OR'
    TOKEN_AND = 'AND'
    TOKEN_NUMBER_REGEX = r'\d+'  # Regex for matching the number

    @transaction.atomic
    def create_filter_criteria_from_string(self, input_expression):
        """
        Create the filter criteria from the string specified.
        """

        tokens = re.findall(r'((?:\d+)|[()]|(?:OR)|(?:AND)|[\w]+)', input_expression)
        expr_stack = []
        for token in tokens:
            if token == self.TOKEN_OPEN_PARENTHESIS:
                expr_stack.append(token)
            elif token == self.TOKEN_CLOSE_PARENTHESIS:
                encompassing_filter = self.__create_filter_within_braces(input_expression, expr_stack)
                expr_stack.append(encompassing_filter)
            elif FilterCriteria.is_valid_operator(token):
                expr_stack.append(token)
            elif re.match(self.TOKEN_NUMBER_REGEX, token):
                tag = Tag.objects.get(pk=int(token))
                filter_for_tag = FilterCriteria(tag=tag)
                filter_for_tag.save()
                expr_stack.append(filter_for_tag)
            else:
                raise MalformedExpressionException(input_expression)
        if len(expr_stack) != 1:
            raise MalformedExpressionException(input_expression)
        return expr_stack

    def __create_filter_within_braces(self, expression, stack):
        """
        A subexpression of the form (A OP B) or (B).
        """
        first_token = stack.pop()  # Gets B from the above expression
        next_token = stack.pop()
        if next_token != self.TOKEN_OPEN_PARENTHESIS:
            if not isinstance(first_token, FilterCriteria):
                raise MalformedExpressionException(expression)
            new_filter = FilterCriteria(right_criteria=first_token)
            new_filter.operator = new_filter.get_operator_id_from_str(next_token)
            next_token = stack.pop()
            if not isinstance(next_token, FilterCriteria):
                raise MalformedExpressionException(expression)
            new_filter.left_criteria = next_token
            next_token = stack.pop()
            if next_token != self.TOKEN_OPEN_PARENTHESIS:
                raise MalformedExpressionException(expression)
            new_filter.save()
            return new_filter
        else:
            return first_token
