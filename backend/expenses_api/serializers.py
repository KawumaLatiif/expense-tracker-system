from rest_framework import serializers
from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    amount = serializers.IntegerField(min_value=1)

    class Meta:
        model = Expense
        fields = [
            "id",
            "description",
            "category",
            "amount",
            "expense_date",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]