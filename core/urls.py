from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register, name='register'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    path('profile/<str:username>/', views.profile, name='profile'),
    path('post/<int:pk>/', views.post_detail, name='post_detail'),
    
    
    # AJAX URLs
    path('like/', views.like_post, name='like_post'),
    path('follow/', views.follow_user, name='follow_user'),
]