from django.contrib import admin

from apps.core.models import NotifyEmail


@admin.register(NotifyEmail)
class NotifyEmailAdmin(admin.ModelAdmin):
    list_display = ('email', 'created_at')          # Show in list view
    search_fields = ('email',)                      # Search by email
    list_filter = ('created_at',)                   # Filter by date
    ordering = ('-created_at',)                     # Newest first
    readonly_fields = ('created_at',)               # Don't allow editing

    fieldsets = (
        (None, {
            'fields': ('email', 'created_at'),
        }),
    )

    def has_change_permission(self, request, obj=None):
        """Prevent editing existing emails."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Allow deleting only if needed (optional)."""
        return True
