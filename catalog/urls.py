from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, EquipmentViewSet, Model3DViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('equipment', EquipmentViewSet, basename='equipment')
router.register('models3d', Model3DViewSet, basename='model3d')

urlpatterns = router.urls
