
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer


    def get_queryset(self):
        # Start with all expenses.
        queryset = Expense.objects.all()

        # Filter by category if provided.
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(
                category__iexact=category.strip()
            )

        # Search descriptions if provided.
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                description__icontains=search.strip()
            )

        # Filter expenses from the selected start date onward.
        start_date = self.request.query_params.get("start_date")
        if start_date:
            queryset = queryset.filter(
                expense_date__gte=start_date
            )

        # Filter expenses up to and including the selected end date.
        end_date = self.request.query_params.get("end_date")
        if end_date:
            queryset = queryset.filter(
                expense_date__lte=end_date
            )

        return queryset



    @action(detail=False, methods=["get"])
    def summary(self, request):
        # Apply the same filters used by the expense list.
        queryset = self.filter_queryset(self.get_queryset())

        # Calculate overall totals.
        totals = queryset.aggregate(
            total_amount=Sum("amount"),
            expense_count=Count("id"),
        )

        # Calculate totals for each category.
        category_summary = (
            queryset.values("category")
            .annotate(
                total_amount=Sum("amount"),
                expense_count=Count("id"),
            )
            .order_by("category")
        )

        return Response({
            "total_amount": totals["total_amount"] or 0,
            "expense_count": totals["expense_count"],
            "by_category": list(category_summary),
        })

    
    @action(detail=False, methods=["get"])
    def monthly_summary(self, request):
        # Apply the same filters used by the expense list.
        queryset = self.filter_queryset(self.get_queryset())

        # Group expenses by month and calculate each month's total.
        monthly_data = (
            queryset.annotate(
                month=TruncMonth("expense_date")
            )
            .values("month")
            .annotate(total_amount=Sum("amount"))
            .order_by("month")
        )

        # Format the month as YYYY-MM for the frontend.
        by_month = [
            {
                "month": item["month"].strftime("%Y-%m"),
                "total_amount": item["total_amount"] or 0,
            }
            for item in monthly_data
        ]

        return Response({
            "by_month": by_month,
        })

