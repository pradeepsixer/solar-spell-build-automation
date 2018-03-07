from django.urls import path
from . import views


urlpatterns = [
    path('', views.index, name='index'),
    path('content/', views.ContentListView.as_view(), name='content'),
    path('content/<int:pk>', views.ContentDetailView.as_view(), name='content-detail'),
]

