"""
URL configuration for posts app.
"""

from django.urls import path
from . import views

app_name = 'posts'

urlpatterns = [
    # Post CRUD
    path('', views.PostListView.as_view(), name='post_list'),
    path('create/', views.PostCreateView.as_view(), name='post_create'),
    path('<uuid:pk>/', views.PostDetailView.as_view(), name='post_detail'),
    path('<uuid:post_id>/delete/', views.delete_post, name='delete_post'),
    
    # Post interactions
    path('<uuid:post_id>/vote/', views.PostVoteView.as_view(), name='post_vote'),
    path('<uuid:post_id>/comments/', views.CommentListCreateView.as_view(), name='post_comments'),
    
    # Comment management
    path('comments/<uuid:comment_id>/delete/', views.delete_comment, name='delete_comment'),
    
    # Discovery
    path('trending/', views.trending_posts, name='trending_posts'),
    path('my-posts/', views.user_posts, name='user_posts'),
]
