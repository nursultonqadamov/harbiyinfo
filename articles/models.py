from django.conf import settings
from django.contrib.contenttypes.fields import GenericRelation
from django.db import models

from core.models import MediaAsset


class Article(models.Model):
    """Shared shape for all long-form content: news, war-history pieces, and
    manuals/guides. Same fields, same behavior -- only `section` differs --
    instead of three near-identical apps."""

    class Section(models.TextChoices):
        NEWS = 'news', 'Yangilik'
        HISTORY = 'history', 'Urushlar tarixi'
        MANUAL = 'manual', "Qo'llanma"

    section = models.CharField(max_length=10, choices=Section.choices)
    title_uz = models.CharField(max_length=255)
    title_en = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(max_length=255, unique=True)
    excerpt_uz = models.CharField(max_length=500, blank=True)
    excerpt_en = models.CharField(max_length=500, blank=True)
    body_uz = models.TextField(blank=True)
    body_en = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='articles/covers/%Y/%m/', blank=True, null=True)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    media = GenericRelation(MediaAsset)

    class Meta:
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title_uz
