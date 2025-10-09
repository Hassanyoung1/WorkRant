"""
Aggregation utilities for companies app.

Provides functions to calculate company statistics and ratings.
"""

from django.db.models import Avg, Count
from .models import CompanyRating


def get_company_ratings(company_id):
    """
    Get aggregated ratings for a company.
    
    Returns dictionary with average ratings across all dimensions.
    """
    ratings = CompanyRating.objects.filter(company_id=company_id).aggregate(
        avg_fairness=Avg('fairness'),
        avg_work_life=Avg('work_life_balance'),
        avg_management_toxicity=Avg('management_toxicity'),
        count=Count('id')
    )
    
    if ratings['count'] == 0:
        return None
    
    return {
        'avg_fairness': round(ratings['avg_fairness'] or 0, 1),
        'avg_work_life': round(ratings['avg_work_life'] or 0, 1),
        'avg_management_toxicity': round(ratings['avg_management_toxicity'] or 0, 1),
        'count': ratings['count']
    }


def get_company_rating_distribution(company_id):
    """
    Get rating distribution (1-5 stars) for each dimension.
    
    Returns nested dictionary with counts for each rating level.
    """
    distributions = {}
    
    for field in ['fairness', 'work_life_balance', 'management_toxicity']:
        distribution = {}
        for rating in range(1, 6):
            count = CompanyRating.objects.filter(
                company_id=company_id,
                **{field: rating}
            ).count()
            distribution[str(rating)] = count
        distributions[field] = distribution
    
    return distributions
