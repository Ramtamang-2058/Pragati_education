# apps/core/urls.py
from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.coming_soon, name='coming_soon'),
    path('subscribe/', views.subscribe_email, name='subscribe_email'),
]