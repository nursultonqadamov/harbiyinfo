from rest_framework import serializers

from core.serializers import MediaAssetSerializer

from .models import Article


class ArticleListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = [
            'id', 'section', 'title_uz', 'title_en', 'slug',
            'excerpt_uz', 'excerpt_en', 'cover_image',
            'is_published', 'published_at',
        ]


class ArticleDetailSerializer(serializers.ModelSerializer):
    media = MediaAssetSerializer(many=True, read_only=True)

    class Meta:
        model = Article
        fields = [
            'id', 'section', 'title_uz', 'title_en', 'slug',
            'excerpt_uz', 'excerpt_en', 'body_uz', 'body_en', 'cover_image',
            'is_published', 'published_at', 'author', 'media',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['author', 'created_at', 'updated_at']
