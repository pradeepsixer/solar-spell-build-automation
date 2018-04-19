"""build_automation URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from rest_framework import routers

from content_management.api_views import (
    AllTagsApiViewSet, CatalogerViewSet, ContentApiViewset, CoverageViewSet, CreatorViewSet, DirectoryCloneApiViewSet,
    DirectoryLayoutViewSet, DirectoryViewSet, DiskSpaceViewSet, KeywordViewSet, LanguageViewSet, SubjectViewSet,
    WorkareaViewSet
)

router = routers.SimpleRouter()
router.register(r'contents', ContentApiViewset)
# router.register(r'tags', TagViewSet, base_name='tag')
router.register(r'directories', DirectoryViewSet)
router.register(r'dirlayouts', DirectoryLayoutViewSet)
router.register(r'dirlayouts/(?P<id>\d+)/clone', DirectoryCloneApiViewSet, base_name='dirlayout')
router.register(r'creators', CreatorViewSet)
router.register(r'coverages', CoverageViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'workareas', WorkareaViewSet)
router.register(r'keywords', KeywordViewSet)
router.register(r'languages', LanguageViewSet)
router.register(r'catalogers', CatalogerViewSet)
router.register(r'alltags', AllTagsApiViewSet, base_name='alltag')
router.register(r'diskspace', DiskSpaceViewSet, base_name='diskspace')

urlpatterns = [
    path('api/', include(router.urls)),
    path('content_management/', include('content_management.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
