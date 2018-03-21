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
from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

from content_management.api_views import ContentApiViewset, TagViewSet, DirectoryCloneApiViewset

router = routers.SimpleRouter()
router.register(r'contents', ContentApiViewset)
router.register(r'tags', TagViewSet, base_name='tag')
router.register(r'dirlayout/(?P<id>\d+)/clone', DirectoryCloneApiViewset, base_name='dirlayout')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
