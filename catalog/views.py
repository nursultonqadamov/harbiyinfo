from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.mixins import MediaUploadMixin
from core.permissions import IsAdminOrReadOnly

from .models import Category, Equipment, EquipmentSpec, Model3D, Model3DPart
from .serializers import (
    CategorySerializer,
    EquipmentDetailSerializer,
    EquipmentListSerializer,
    EquipmentSpecSerializer,
    Model3DDetailSerializer,
    Model3DListSerializer,
    Model3DPartSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'


class EquipmentViewSet(MediaUploadMixin, viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    filterset_fields = ['category', 'is_published']
    search_fields = ['title_uz', 'title_en', 'short_description_uz', 'short_description_en']

    def get_queryset(self):
        qs = Equipment.objects.select_related('category').all()
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_published=True)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return EquipmentListSerializer
        return EquipmentDetailSerializer

    def perform_create(self, serializer):
        extra = {}
        if serializer.validated_data.get('is_published'):
            extra['published_at'] = timezone.now()
        serializer.save(**extra)

    def perform_update(self, serializer):
        extra = {}
        if serializer.validated_data.get('is_published') and not serializer.instance.published_at:
            extra['published_at'] = timezone.now()
        serializer.save(**extra)

    @action(detail=True, methods=['post'], url_path='specs')
    def add_spec(self, request, slug=None):
        equipment = self.get_object()
        serializer = EquipmentSpecSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(equipment=equipment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path=r'specs/(?P<spec_id>[^/.]+)')
    def delete_spec(self, request, slug=None, spec_id=None):
        deleted, _ = EquipmentSpec.objects.filter(pk=spec_id, equipment__slug=slug).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class Model3DViewSet(viewsets.ModelViewSet):
    queryset = Model3D.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'list':
            return Model3DListSerializer
        return Model3DDetailSerializer

    @action(detail=True, methods=['put'], url_path='parts')
    def replace_parts(self, request, slug=None):
        """The admin's part-labeling tool scans every mesh in the model at
        once and saves all labels together, so this replaces the whole set
        rather than editing rows one at a time."""
        model = self.get_object()
        serializer = Model3DPartSerializer(data=request.data.get('parts', []), many=True)
        serializer.is_valid(raise_exception=True)

        model.parts.all().delete()
        Model3DPart.objects.bulk_create(
            [Model3DPart(model=model, **part) for part in serializer.validated_data]
        )
        return Response(Model3DDetailSerializer(model, context=self.get_serializer_context()).data)
