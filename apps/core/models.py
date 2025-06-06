from django.db import models


class NotifyEmail(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

    class Meta:
        verbose_name = "Notify Email"
        verbose_name_plural = "Notify Emails"
