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

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)

        for instance in instances:
            if isinstance(instance, FOIAction) and not instance.created_by_id:
                instance.created_by = request.user
            instance.save()

        formset.save_m2m()
