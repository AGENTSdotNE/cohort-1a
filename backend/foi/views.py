from django.db import transaction
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import FOIAction, FOICase
from .serializers import (
    FOIActionNoteSerializer,
    FOICaseOwnerSerializer,
    FOICaseSerializer,
    FOIDecisionSerializer,
    FOIStatusChangeSerializer,
)

# Status changes an officer can make through the /status/ action. possible/confirmed are only
# reached through /decide/; every case starts at possible or not_foi (see flagging.auto_flag).
FORWARD_STATUS_TRANSITIONS = {
    FOICase.Status.CONFIRMED: FOICase.Status.RESPONDED,
    FOICase.Status.RESPONDED: FOICase.Status.CLOSED,
    FOICase.Status.NOT_FOI: FOICase.Status.CLOSED,
}


class FOICaseViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet
):
    http_method_names = ['get', 'post', 'patch']

    def get_queryset(self):
        # Shared on purpose, like InboundItemViewSet: every signed-in officer sees every case.
        queryset = FOICase.objects.select_related('item', 'owner', 'decided_by').prefetch_related(
            Prefetch('actions', queryset=FOIAction.objects.select_related('created_by'))
        )
        status_filter = self.request.query_params.get('status')

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def get_serializer_class(self):
        if self.action == 'partial_update':
            return FOICaseOwnerSerializer
        return FOICaseSerializer

    def partial_update(self, request, *args, **kwargs):
        case = self.get_object()
        serializer = self.get_serializer(case, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(FOICaseSerializer(case).data)

    @action(detail=True, methods=['post'])
    def decide(self, request, pk=None):
        serializer = FOIDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Locks the row for the whole read-check-write so two concurrent decisions on the same case
        # can't both pass the status check before either one writes.
        with transaction.atomic():
            case = get_object_or_404(FOICase.objects.select_for_update(), pk=pk)

            if case.status != FOICase.Status.POSSIBLE:
                return Response({'detail': 'This case has already been decided.'}, status=status.HTTP_400_BAD_REQUEST)

            case.decided_by = request.user
            case.decided_at = timezone.now()

            if serializer.validated_data['decision'] == 'confirm':
                case.status = FOICase.Status.CONFIRMED
                note = 'Confirmed as FOI.'
            else:
                case.status = FOICase.Status.NOT_FOI
                case.department = serializer.validated_data['department']
                note = f'Marked as not FOI and routed to {case.get_department_display()}.'

            case.save()
            FOIAction.objects.create(case=case, note=note, new_status=case.status, created_by=request.user)

        return Response(FOICaseSerializer(case).data)

    @action(detail=True, methods=['post'], url_path='status')
    def change_status(self, request, pk=None):
        serializer = FOIStatusChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']

        with transaction.atomic():
            case = get_object_or_404(FOICase.objects.select_for_update(), pk=pk)

            if FORWARD_STATUS_TRANSITIONS.get(case.status) != new_status:
                return Response(
                    {'detail': f'Cannot move from "{case.get_status_display()}" to "{new_status}".'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if new_status == FOICase.Status.CLOSED:
                case.status_before_close = case.status

            case.status = new_status
            case.save(update_fields=['status', 'status_before_close'])
            FOIAction.objects.create(
                case=case, note=serializer.validated_data['note'], new_status=new_status, created_by=request.user
            )

        return Response(FOICaseSerializer(case).data)

    @action(detail=True, methods=['post'])
    def reopen(self, request, pk=None):
        with transaction.atomic():
            case = get_object_or_404(FOICase.objects.select_for_update(), pk=pk)

            if case.status != FOICase.Status.CLOSED:
                return Response({'detail': 'This case is not closed.'}, status=status.HTTP_400_BAD_REQUEST)

            case.status = case.status_before_close
            case.status_before_close = ''
            case.save(update_fields=['status', 'status_before_close'])
            FOIAction.objects.create(case=case, note='Reopened.', new_status=case.status, created_by=request.user)

        return Response(FOICaseSerializer(case).data)

    @action(detail=True, methods=['post'])
    def actions(self, request, pk=None):
        case = self.get_object()
        serializer = FOIActionNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        FOIAction.objects.create(case=case, note=serializer.validated_data['note'], created_by=request.user)

        return Response(FOICaseSerializer(case).data)
