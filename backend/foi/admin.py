from django.contrib import admin

from .models import FOIAction, FOICase


class FOIActionInline(admin.TabularInline):
    model = FOIAction
    extra = 0
    readonly_fields = ['created_by', 'created_at']


@admin.register(FOICase)
class FOICaseAdmin(admin.ModelAdmin):
    list_display = ['item', 'status', 'confidence', 'deadline', 'owner']
    list_filter = ['status', 'confidence', 'department']
    inlines = [FOIActionInline]
