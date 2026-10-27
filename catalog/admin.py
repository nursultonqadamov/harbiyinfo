from django.contrib import admin

from .models import Category, Equipment, EquipmentSpec, Model3D, Model3DPart

admin.site.register(Category)
admin.site.register(Equipment)
admin.site.register(EquipmentSpec)
admin.site.register(Model3D)
admin.site.register(Model3DPart)
