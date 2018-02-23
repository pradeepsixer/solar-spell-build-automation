from django.conf.urls import url, include
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('search', views.search, name='search'),
]
