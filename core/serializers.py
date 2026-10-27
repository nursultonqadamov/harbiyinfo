from rest_framework import serializers

from .models import MediaAsset


class MediaAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaAsset
        fields = ['id', 'media_type', 'file', 'youtube_url', 'caption', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']
