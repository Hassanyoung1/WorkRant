"""
URL configuration for companies app.
"""

from django.urls import path
from . import views

app_name = 'companies'

urlpatterns = [
    # Company CRUD
    path('', views.CompanyListView.as_view(), name='company_list'),
    path('create/', views.CompanyCreateView.as_view(), name='company_create'),
    
    # Company search and discovery (must be before slug pattern)
    path('search/', views.company_search, name='company_search'),
    path('trending/', views.trending_companies, name='trending_companies'),
    
    # Company detail (slug pattern - must be last to avoid catching other paths)
    path('<slug:slug>/', views.CompanyDetailView.as_view(), name='company_detail'),
    
    # Company ratings
    path('<uuid:company_id>/rating/', views.CompanyRatingView.as_view(), name='company_rating'),
    path('<uuid:company_id>/stats/', views.company_stats, name='company_stats'),
]
