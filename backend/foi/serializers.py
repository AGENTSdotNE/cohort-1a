from rest_framework import serializers

from inbound.serializers import InboundItemSerializer

from .models import Department, FOIAction, FOICase


def _email_or_none(user):
    return user.email if user else None


class FOIActionSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()

    class Meta:
        model = FOIAction
        fields = ['id', 'note', 'new_status', 'created_by', 'created_at']
        read_only_fields = fields

    def get_created_by(self, action):
        return _email_or_none(action.created_by)


class FOICaseSerializer(serializers.ModelSerializer):
    item = InboundItemSerializer(read_only=True)
    owner = serializers.SerializerMethodField()
    decided_by = serializers.SerializerMethodField()
    is_overdue = serializers.BooleanField(read_only=True)
    actions = FOIActionSerializer(many=True, read_only=True)

    class Meta:
        model = FOICase
        fields = [
            'id',
            'item',
            'status',
            'confidence',
            'score',
            'reasons',
            'suggest_sar',
            'department',
            'owner',
            'deadline',
            'is_overdue',
            'decided_by',
            'decided_at',
            'created_at',
            'actions',
        ]
        read_only_fields = fields

    def get_owner(self, case):
        return _email_or_none(case.owner)

    def get_decided_by(self, case):
        return _email_or_none(case.decided_by)


class FOICaseOwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = FOICase
        fields = ['owner']


class FOIDecisionSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=['confirm', 'route'])
    department = serializers.ChoiceField(choices=Department.choices, required=False, allow_blank=True, default='')

    def validate(self, attrs):
        if attrs['decision'] == 'route' and not attrs['department']:
            raise serializers.ValidationError({'department': 'This field is required when routing an item.'})

        if attrs['decision'] == 'confirm' and attrs['department']:
            raise serializers.ValidationError({'department': 'This field is not used when confirming an item.'})

        return attrs


class FOIStatusChangeSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['responded', 'closed'])
    note = serializers.CharField()


class FOIActionNoteSerializer(serializers.Serializer):
    note = serializers.CharField()
