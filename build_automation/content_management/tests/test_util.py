import re
import tempfile
from unittest.mock import patch

from django.test import TestCase

from content_management.exceptions import MalformedExpressionException
from content_management.models import FilterCriteria, Tag
from content_management.utils import FilterCriteriaUtil, HashUtil


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


class FilterCriteriaUtilTest(TestCase):
    def setUp(self):
        self.tag1 = Tag(name="Tag 1")
        self.tag2 = Tag(name="Tag 2")
        self.tag3 = Tag(name="Tag 3")
        self.tag4 = Tag(name="Tag 4")
        Tag.objects.bulk_create([self.tag1, self.tag2, self.tag3, self.tag4])

    def test_create_filter_criteria_from_string(self):
        """
        Test whether the filter criteria are actually created from the given string.
        """

        input_expression = "((%d op_foo %d) op_bar (%d op_bar %d))" % (
            self.tag1.id, self.tag2.id, self.tag3.id, self.tag4.id
        )
        mock_operators = (
            (1, 'op_foo'),
            (2, 'op_bar'),
        )

        with patch('content_management.models.FilterCriteria.OPERATOR_CHOICES', mock_operators):
            num_criteria = FilterCriteria.objects.count()
            self.assertEqual(num_criteria, 0)
            filter_criteria_util = FilterCriteriaUtil()
            filter_criteria_util.create_filter_criteria_from_string(input_expression)
            num_criteria = FilterCriteria.objects.count()
            complete_criteria = FilterCriteria.objects.last()
            self.assertEqual(complete_criteria.operator_str, 'op_bar')
            tag1_tag2_criteria = complete_criteria.left_criteria
            self.assertEqual(tag1_tag2_criteria.operator_str, 'op_foo')
            tag3_tag4_criteria = complete_criteria.right_criteria
            self.assertEqual(tag3_tag4_criteria.operator_str, 'op_bar')
            tag1_criteria = tag1_tag2_criteria.left_criteria
            tag2_criteria = tag1_tag2_criteria.right_criteria
            tag3_criteria = tag3_tag4_criteria.left_criteria
            tag4_criteria = tag3_tag4_criteria.right_criteria
            self.assertEqual(tag1_criteria.tag, self.tag1)
            self.assertEqual(tag2_criteria.tag, self.tag2)
            self.assertEqual(tag3_criteria.tag, self.tag3)
            self.assertEqual(tag4_criteria.tag, self.tag4)
            self.assertEqual(num_criteria, 7)

    def test_create_filter_criteria_from_string_single_tag(self):
        """
        Test whether the filter criteria are actually created from the given string.
        """

        input_expression = "(%d)" % self.tag1.id
        mock_operators = (
            (1, 'op_foo'),
            (2, 'op_bar'),
        )

        with patch('content_management.models.FilterCriteria.OPERATOR_CHOICES', mock_operators):
            filter_criteria_util = FilterCriteriaUtil()
            num_criteria = FilterCriteria.objects.count()
            self.assertEqual(num_criteria, 0)
            filter_criteria_util.create_filter_criteria_from_string(input_expression)
            complete_criteria = FilterCriteria.objects.last()
            self.assertEqual(complete_criteria.tag, self.tag1)
            num_criteria = FilterCriteria.objects.count()
            self.assertEqual(num_criteria, 1)

    def test_create_filter_criteria_from_string_invalid_token(self):
        """
        Tests whether the MalformedExpressionException is thrown when the input expression has an invalid
        token
        """
        input_expression = "(blah)"
        mock_operators = (
            (1, 'op_foo'),
            (2, 'op_bar'),
        )

        expected_message = "The given expression %s is malformed." % re.escape(input_expression)
        with patch('content_management.models.FilterCriteria.OPERATOR_CHOICES', mock_operators):
            with self.assertRaisesRegex(MalformedExpressionException, expected_message):
                filter_criteria_util = FilterCriteriaUtil()
                filter_criteria_util.create_filter_criteria_from_string(input_expression)

    def test_create_filter_criteria_from_string_invalid_format(self):
        """
        Tests whether the MalformedExpressionException is raised when the format is not valid, but the
        tokens are valid
        """
        input_expression = "(%d op_foo %d)(%d op_bar %d)" % (
            self.tag1.id, self.tag2.id, self.tag3.id, self.tag4.id
        )
        mock_operators = (
            (1, 'op_foo'),
            (2, 'op_bar'),
        )

        expected_message = "The given expression %s is malformed." % re.escape(input_expression)
        with patch('content_management.models.FilterCriteria.OPERATOR_CHOICES', mock_operators):
            with self.assertRaisesRegex(MalformedExpressionException, expected_message):
                filter_criteria_util = FilterCriteriaUtil()
                filter_criteria_util.create_filter_criteria_from_string(input_expression)

    def test_create_filter_criteria_from_string_invalid_format_2(self):
        """
        Tests whether the MalformedExpressionException is raised when the format is not valid, but the
        tokens are valid
        """
        input_expression = "(op_foo op_foo %d)(%d op_bar %d)" % (
            self.tag1.id, self.tag2.id, self.tag3.id
        )
        mock_operators = (
            (1, 'op_foo'),
            (2, 'op_bar'),
        )

        expected_message = "The given expression %s is malformed." % re.escape(input_expression)
        with patch('content_management.models.FilterCriteria.OPERATOR_CHOICES', mock_operators):
            with self.assertRaisesRegex(MalformedExpressionException, expected_message):
                filter_criteria_util = FilterCriteriaUtil()
                filter_criteria_util.create_filter_criteria_from_string(input_expression)

    def test_create_filter_criteria_from_string_invalid_format_3(self):
        """
        Tests whether the MalformedExpressionException is raised when the format is not valid, but the
        tokens are valid
        """
        input_expression = "(%d op_foo op_bar)(%d op_bar %d)" % (
            self.tag1.id, self.tag2.id, self.tag3.id
        )
        mock_operators = (
            (1, 'op_foo'),
            (2, 'op_bar'),
        )

        expected_message = "The given expression %s is malformed." % re.escape(input_expression)
        with patch('content_management.models.FilterCriteria.OPERATOR_CHOICES', mock_operators):
            with self.assertRaisesRegex(MalformedExpressionException, expected_message):
                filter_criteria_util = FilterCriteriaUtil()
                filter_criteria_util.create_filter_criteria_from_string(input_expression)

    def test_create_filter_criteria_from_string_invalid_format_4(self):
        """
        Tests whether the MalformedExpressionException is raised when the format is not valid, but the
        tokens are valid
        """
        input_expression = "op_bar %d op_foo %d)" % (
            self.tag1.id, self.tag2.id
        )
        mock_operators = (
            (1, 'op_foo'),
            (2, 'op_bar'),
        )

        expected_message = "The given expression %s is malformed." % re.escape(input_expression)
        with patch('content_management.models.FilterCriteria.OPERATOR_CHOICES', mock_operators):
            with self.assertRaisesRegex(MalformedExpressionException, expected_message):
                filter_criteria_util = FilterCriteriaUtil()
                filter_criteria_util.create_filter_criteria_from_string(input_expression)
