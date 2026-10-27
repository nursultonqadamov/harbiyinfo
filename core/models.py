from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class MediaAsset(models.Model):
    """A single image or video attached to any content object (Article,
    Equipment, ...). One shared model so every content type gets the same
    upload/gallery/ordering behavior instead of a per-app media table."""

    class MediaType(models.TextChoices):
        IMAGE = 'image', 'Rasm'
        VIDEO = 'video', 'Video'
        YOUTUBE = 'youtube', 'YouTube'

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    media_type = models.CharField(max_length=10, choices=MediaType.choices)
    # Exactly one of file/youtube_url is set, depending on media_type.
    file = models.FileField(upload_to='media/%Y/%m/', blank=True, null=True)
    youtube_url = models.URLField(blank=True)
    caption = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        indexes = [models.Index(fields=['content_type', 'object_id'])]

    def __str__(self):
        return f'{self.get_media_type_display()}: {self.file.name}'
