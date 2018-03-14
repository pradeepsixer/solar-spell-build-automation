from unittest.mock import patch

from django.test import TestCase

from content_management.exceptions import InvalidOperatorException
from content_management.models import FilterCriteria


class FilterCriteriaTest(TestCase):
    def test_operator_str_property(self):
        """
        Tests the operator_str property on the DirectoryLayout model.
        """
        mock_operators = (
            (1, 'foo'),
            (2, 'bar'),
        )

        with patch('content_management.models.FilterCriteria.OPERATOR_CHOICES', mock_operators):
            criteria = FilterCriteria(operator=1)
            self.assertEqual(criteria.operator_str, 'foo')
            criteria.operator = 2
            self.assertEqual(criteria.operator_str, 'bar')

    def test_operator_str_property_for_no_operator(self):
        """
        Tests the operator_str property on the DirectoryLayout model.
        """
        criteria = FilterCriteria()
        self.assertIsNone(criteria.operator_str)

    def test_is_valid_operator(self):
        """
        Tests whether the is_valid_operator method returns True for valid operators.
        """
        mock_operators = (
            (1, 'foo'),
            (2, 'bar'),
        )

        with patch('content_management.models.FilterCriteria.OPERATOR_CHOICES', mock_operators):
            self.assertTrue(FilterCriteria.is_valid_operator('foo'))
            self.assertTrue(FilterCriteria.is_valid_operator('bar'))

    def test_is_valid_operator_false(self):
        """
        Tests whether the is_valid_operator method returns False for invalid operators.
        """
        mock_operators = (
            (1, 'foo'),
            (2, 'bar'),
        )

        with patch('content_management.models.FilterCriteria.OPERATOR_CHOICES', mock_operators):
            self.assertFalse(FilterCriteria.is_valid_operator('foobar'))

    def test_get_operator_id_from_str(self):
        """
        Tests the get_operator_id_from_str() method
        """
        mock_operators = (
            (1, 'foo'),
            (2, 'bar'),
        )

        with patch('content_management.models.FilterCriteria.OPERATOR_CHOICES', mock_operators):
            self.assertEqual(FilterCriteria.get_operator_id_from_str('foo'), 1)
            self.assertEqual(FilterCriteria.get_operator_id_from_str('bar'), 2)

    def test_get_operator_id_from_str_invalid_operator(self):
        """
        Tests whether the get_operator_id_from_str() method raises InvalidOperatorException when an
        invalid operator string is provided.
        """
        mock_operators = (
            (1, 'foo'),
            (2, 'bar'),
        )

        with patch('content_management.models.FilterCriteria.OPERATOR_CHOICES', mock_operators):
            with self.assertRaisesRegex(InvalidOperatorException, "An invalid operator %s is encountered" % 'foobar'):
                criteria = FilterCriteria()
                criteria.get_operator_id_from_str('foobar')
