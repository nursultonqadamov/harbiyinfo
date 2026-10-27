from django.contrib.contenttypes.fields import GenericRelation
from django.db import models

from core.models import MediaAsset


class Category(models.Model):
    name_uz = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100, blank=True)
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name_uz']

    def __str__(self):
        return self.name_uz


class Equipment(models.Model):
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='equipment')
    title_uz = models.CharField(max_length=255)
    title_en = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(max_length=255, unique=True)
    short_description_uz = models.CharField(max_length=500, blank=True)
    short_description_en = models.CharField(max_length=500, blank=True)
    full_description_uz = models.TextField(blank=True)
    full_description_en = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='catalog/covers/%Y/%m/', blank=True, null=True)
    # Must match a Model3D.slug (see below) -- the admin picks an already
    # uploaded/labeled model, adding a genuinely new one is a separate step.
    viewer_slug = models.CharField(max_length=100, blank=True)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    media = GenericRelation(MediaAsset)

    class Meta:
        verbose_name_plural = 'Equipment'
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title_uz


class EquipmentSpec(models.Model):
    """Flexible key/value technical spec row (caliber, speed, crew, range,
    ...) -- these vary too much per equipment type for fixed columns."""

    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='specs')
    label = models.CharField(max_length=100)
    value = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.label}: {self.value}'


class Model3D(models.Model):
    """An uploaded 3D model (.glb) for the interactive x-ray viewer, plus the
    handful of viewer-tuning knobs a model occasionally needs. Equipment.
    viewer_slug points at one of these by slug -- adding a genuinely new
    model is now an admin upload + part-labeling task, not a dev task."""

    slug = models.SlugField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='models3d/%Y/%m/')
    credit_text = models.CharField(max_length=255, blank=True)
    # Comma-separated raw mesh names that should always render as
    # translucent glass (cockpit canopy, windshield, ...). Optional.
    glass_mesh_names = models.TextField(blank=True)
    glass_base_opacity = models.FloatField(default=0.35)
    # Rare: hinged sub-parts (a radome, a canopy) that ship "open" in the
    # source file and should ease shut on load. Advanced/uncommon enough to
    # edit as raw JSON rather than build dedicated UI for, e.g.
    # [{"names": ["nose"], "closedDegX": -90}]
    closing_panels = models.JSONField(blank=True, default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Model3DPart(models.Model):
    """Display title/description for one raw mesh name inside a Model3D,
    filled in by the admin via the in-browser part-labeling tool."""

    model = models.ForeignKey(Model3D, on_delete=models.CASCADE, related_name='parts')
    mesh_name = models.CharField(max_length=255)
    title_uz = models.CharField(max_length=255, blank=True)
    title_en = models.CharField(max_length=255, blank=True)
    description_uz = models.TextField(blank=True)
    description_en = models.TextField(blank=True)

    class Meta:
        unique_together = [('model', 'mesh_name')]

    def __str__(self):
        return f'{self.model.slug}: {self.mesh_name}'
