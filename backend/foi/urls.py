from rest_framework.routers import SimpleRouter

from .views import FOICaseViewSet

router = SimpleRouter()
router.register('foi', FOICaseViewSet, basename='foi-case')

urlpatterns = router.urls
