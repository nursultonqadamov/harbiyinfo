import json

from rest_framework import serializers

from core.serializers import MediaAssetSerializer

from .models import Category, Equipment, EquipmentSpec, Model3D, Model3DPart


class LenientJSONField(serializers.JSONField):
    """DRF's own JSONField doesn't parse a JSON-formatted *string* value
    (which is exactly what arrives when this is submitted via a multipart
    form, e.g. the admin's Model3D edit form, alongside an optional file
    upload) -- it only auto-decodes bytes. Accept a plain string here too."""

    def to_internal_value(self, data):
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except ValueError:
                self.fail('invalid')
        return super().to_internal_value(data)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name_uz', 'name_en', 'slug']


class EquipmentSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentSpec
        fields = ['id', 'label', 'value', 'order']


class EquipmentListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Equipment
        fields = [
            'id', 'category', 'title_uz', 'title_en', 'slug',
            'short_description_uz', 'short_description_en', 'cover_image',
            'viewer_slug', 'is_published', 'published_at',
        ]


class EquipmentDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source='category', queryset=Category.objects.all(), write_only=True, required=False, allow_null=True
    )
    specs = EquipmentSpecSerializer(many=True, read_only=True)
    media = MediaAssetSerializer(many=True, read_only=True)

    class Meta:
        model = Equipment
        fields = [
            'id', 'category', 'category_id', 'title_uz', 'title_en', 'slug',
            'short_description_uz', 'short_description_en', 'cover_image',
            'full_description_uz', 'full_description_en', 'viewer_slug',
            'is_published', 'published_at', 'specs', 'media',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {'cover_image': {'required': False}}


class Model3DPartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model3DPart
        fields = ['id', 'mesh_name', 'title_uz', 'title_en', 'description_uz', 'description_en']
        read_only_fields = ['id']


class Model3DListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model3D
        fields = ['id', 'slug', 'title']


class Model3DDetailSerializer(serializers.ModelSerializer):
    parts = Model3DPartSerializer(many=True, read_only=True)
    closing_panels = LenientJSONField(required=False)

    class Meta:
        model = Model3D
        fields = [
            'id', 'slug', 'title', 'file', 'credit_text',
            'glass_mesh_names', 'glass_base_opacity', 'closing_panels',
            'parts', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
        # Editing a model's basic info (title/credit/glass names) shouldn't
        # force re-uploading the .glb every time.
        extra_kwargs = {'file': {'required': False}}
