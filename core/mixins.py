from rest_framework import status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import MediaAsset
from .serializers import MediaAssetSerializer


class MediaUploadMixin:
    """Adds image/video gallery endpoints to a ModelViewSet:
    POST   .../{id}/media/            -- upload one file (multipart)
    DELETE .../{id}/media/{media_id}/ -- remove one

    Shared by ArticleViewSet and EquipmentViewSet so both content types get
    the exact same upload/gallery behavior instead of duplicated code."""

    # Accepts **kwargs rather than a hardcoded pk= since consumers of this
    # mixin (Article, Equipment) look objects up by slug, not pk.
    @action(detail=True, methods=['post'], url_path='media', parser_classes=[MultiPartParser, FormParser])
    def upload_media(self, request, *args, **kwargs):
        obj = self.get_object()
        serializer = MediaAssetSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(content_object=obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path=r'media/(?P<media_id>[^/.]+)')
    def delete_media(self, request, media_id=None, *args, **kwargs):
        obj = self.get_object()
        deleted, _ = MediaAsset.objects.filter(
            pk=media_id,
            content_type__model=obj._meta.model_name,
            object_id=obj.pk,
        ).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
