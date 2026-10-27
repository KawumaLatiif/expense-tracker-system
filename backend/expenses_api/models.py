
from django.db import models


class Expense(models.Model):
    description = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    amount = models.PositiveBigIntegerField()
    expense_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-expense_date", "-id"]

    def __str__(self):
        return f"{self.description} - {self.amount}"
