from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from two_factor.urls import urlpatterns as two_factor_urls

urlpatterns = [
    # 2FA setup/login for /django-admin/.
    # two_factor_urls is already the (patterns, 'two_factor') tuple
    # include() expects -- passing 'two_factor.urls' as a bare module path
    # instead makes Django 6's include() choke trying to iterate that tuple
    # as if it were a urlpatterns list. The individual patterns already
    # start with 'account/' (e.g. 'account/login/'), so no prefix here --
    # adding one doubles it into /account/account/login/.
    path('', include(two_factor_urls)),

    # Moved off the bare "admin/" path -- that's now the Next.js custom CMS
    # (frontend-next/app/admin/**), which lives at the same public origin
    # in production and would otherwise collide with Django's own admin.
    path('django-admin/', admin.site.urls),

    path('api/v1/', include('core.urls')),
    path('api/v1/articles/', include('articles.urls')),
    path('api/v1/catalog/', include('catalog.urls')),
]

if settings.DEBUG:
    urlpatterns += [
        path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
        path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
        path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
