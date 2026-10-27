
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse

from .models import Expense


class ExpenseAPITests(APITestCase):
    def setUp(self):
        # Create sample records in Django's temporary test database.
        Expense.objects.create(
            description="Cafe Javas",
            category="Food",
            amount=54000,
            expense_date="2026-10-24",
        )
        Expense.objects.create(
            description="Lunch",
            category="Food",
            amount=13000,
            expense_date="2026-10-01",
        )
        Expense.objects.create(
            description="Air Ticket",
            category="Transport",
            amount=890000,
            expense_date="2026-10-25",
        )

    def test_filter_expenses_by_category(self):
        response = self.client.get(
            reverse("expense-list"),
            {"category": "Food"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertTrue(
            all(item["category"] == "Food" for item in response.data)
        )

    def test_search_expenses_by_description(self):
        response = self.client.get(
            reverse("expense-list"),
            {"search": "air"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["description"], "Air Ticket")

    def test_combine_category_and_search(self):
        response = self.client.get(
            reverse("expense-list"),
            {"category": "Food", "search": "cafe"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["description"], "Cafe Javas")

    def test_expense_summary(self):
        response = self.client.get(reverse("expense-summary"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_amount"], 957000)
        self.assertEqual(response.data["expense_count"], 3)

        categories = {
            item["category"]: item
            for item in response.data["by_category"]
        }

        self.assertEqual(categories["Food"]["total_amount"], 67000)
        self.assertEqual(categories["Food"]["expense_count"], 2)
        self.assertEqual(categories["Transport"]["total_amount"], 890000)

    def test_filtered_expense_summary(self):
        response = self.client.get(
            reverse("expense-summary"),
            {"category": "Food"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_amount"], 67000)
        self.assertEqual(response.data["expense_count"], 2)
        self.assertEqual(len(response.data["by_category"]), 1)
