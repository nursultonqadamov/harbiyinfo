from django.utils import timezone
from rest_framework import viewsets

from core.mixins import MediaUploadMixin
from core.permissions import IsAdminOrReadOnly

from .models import Article
from .serializers import ArticleDetailSerializer, ArticleListSerializer


class ArticleViewSet(MediaUploadMixin, viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    filterset_fields = ['section', 'is_published']
    search_fields = ['title_uz', 'title_en', 'excerpt_uz', 'excerpt_en']

    def get_queryset(self):
        qs = Article.objects.all()
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_published=True)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return ArticleListSerializer
        return ArticleDetailSerializer

    def perform_create(self, serializer):
        extra = {'author': self.request.user}
        if serializer.validated_data.get('is_published'):
            extra['published_at'] = timezone.now()
        serializer.save(**extra)

    def perform_update(self, serializer):
        extra = {}
        if serializer.validated_data.get('is_published') and not serializer.instance.published_at:
            extra['published_at'] = timezone.now()
        serializer.save(**extra)
