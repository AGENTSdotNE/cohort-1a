from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import UserSummarySerializer

User = get_user_model()


class UserListView(APIView):
    """Every registered user, for pickers elsewhere in the app (e.g. assigning an owner)."""

    def get(self, request):
        return Response(UserSummarySerializer(User.objects.order_by('email'), many=True).data)
