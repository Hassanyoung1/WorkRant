"""
URL configuration for moderation app.
"""

from django.urls import path
from . import views

app_name = 'moderation'

urlpatterns = [
    # Reporting
    path('reports/', views.ReportListView.as_view(), name='report_list'),
    path('reports/create/', views.ReportCreateView.as_view(), name='report_create'),
    path('reports/<uuid:pk>/', views.ReportDetailView.as_view(), name='report_detail'),
    path('reports/<uuid:report_id>/action/', views.ReportActionView.as_view(), name='report_action'),
    path('reports/reasons/', views.report_reasons, name='report_reasons'),
    
    # Content moderation (admin only)
    path('moderate/<str:content_type>/<uuid:object_id>/', 
         views.ContentModerationView.as_view(), name='moderate_content'),
    
    # Admin dashboard
    path('stats/', views.moderation_stats, name='moderation_stats'),
    path('audit-logs/', views.admin_audit_logs, name='admin_audit_logs'),
]
