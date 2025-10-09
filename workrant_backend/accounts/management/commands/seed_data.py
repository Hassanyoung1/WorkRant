"""
Management command to seed the database with sample data for development.
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import User
from companies.models import Company, CompanyRating
from posts.models import Post, Comment, Vote
import uuid
import random


class Command(BaseCommand):
    help = 'Seed the database with sample data for development'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=20,
            help='Number of users to create'
        )
        parser.add_argument(
            '--companies',
            type=int,
            default=10,
            help='Number of companies to create'
        )
        parser.add_argument(
            '--posts',
            type=int,
            default=50,
            help='Number of posts to create'
        )

    def handle(self, *args, **options):
        with transaction.atomic():
            self.stdout.write('Creating sample data...')
            
            # Create users
            users = self.create_users(options['users'])
            self.stdout.write(f'Created {len(users)} users')
            
            # Create companies
            companies = self.create_companies(options['companies'])
            self.stdout.write(f'Created {len(companies)} companies')
            
            # Create company ratings
            self.create_company_ratings(users, companies)
            self.stdout.write('Created company ratings')
            
            # Create posts
            posts = self.create_posts(users, companies, options['posts'])
            self.stdout.write(f'Created {len(posts)} posts')
            
            # Create comments
            self.create_comments(users, posts)
            self.stdout.write('Created comments')
            
            # Create votes
            self.create_votes(users, posts)
            self.stdout.write('Created votes')
            
            self.stdout.write(
                self.style.SUCCESS('Successfully seeded database!')
            )

    def create_users(self, count):
        """Create sample users."""
        pseudonyms = [
            'TechWhistle', 'CodeWarrior', 'DevAnon', 'WorkLife99', 'ByteBuster',
            'PixelPusher', 'DataDriven', 'AgileNinja', 'ScrumMaster', 'DevOpsGuru',
            'CloudNative', 'FullStackDev', 'BackendBeast', 'FrontendFox', 'QAQueen',
            'ProductPerson', 'DesignDynamo', 'MarketingMind', 'SalesSlinger', 'HRHero'
        ]
        
        users = []
        for i in range(min(count, len(pseudonyms))):
            user = User.objects.create_user(
                pseudonym=pseudonyms[i],
                password='testpass123' if i % 3 == 0 else None  # Some persistent, some ephemeral
            )
            users.append(user)
        
        return users

    def create_companies(self, count):
        """Create sample companies."""
        company_data = [
            ('TechCorp', 'Technology'),
            ('DataSystems', 'Technology'),
            ('CloudFirst', 'Technology'),
            ('DevTools Inc', 'Technology'),
            ('FinanceFlow', 'Finance'),
            ('HealthTech', 'Healthcare'),
            ('EduPlatform', 'Education'),
            ('RetailGiant', 'Retail'),
            ('MediaHub', 'Media'),
            ('StartupX', 'Technology'),
        ]
        
        companies = []
        for i in range(min(count, len(company_data))):
            name, industry = company_data[i]
            company = Company.objects.create(
                name=name,
                industry=industry
            )
            companies.append(company)
        
        return companies

    def create_company_ratings(self, users, companies):
        """Create sample company ratings."""
        for company in companies:
            # Create 3-8 ratings per company
            raters = random.sample(users, random.randint(3, min(8, len(users))))
            for user in raters:
                CompanyRating.objects.create(
                    company=company,
                    user=user,
                    fairness=random.randint(1, 5),
                    work_life_balance=random.randint(1, 5),
                    management_toxicity=random.randint(1, 5)
                )

    def create_posts(self, users, companies, count):
        """Create sample posts."""
        post_templates = [
            "The management at this company is completely out of touch with reality.",
            "Great work-life balance and supportive team culture here.",
            "Promotion process is incredibly unfair and biased.",
            "Learning opportunities are amazing, but the pay is below market.",
            "Toxic workplace culture with no HR support whatsoever.",
            "Best company I've ever worked for - highly recommend!",
            "Constant overtime with no compensation or recognition.",
            "The interview process was a nightmare and red flag central.",
            "Remote work policy is flexible and well-implemented.",
            "Layoffs handled very poorly with zero communication.",
        ]
        
        posts = []
        for i in range(count):
            content = random.choice(post_templates)
            post = Post.objects.create(
                author=random.choice(users),
                company=random.choice(companies) if random.random() > 0.2 else None,
                content=content,
                post_type=random.choice(['experience', 'question', 'advice'])
            )
            posts.append(post)
        
        return posts

    def create_comments(self, users, posts):
        """Create sample comments on posts."""
        comment_templates = [
            "I had a similar experience at my previous company.",
            "Thanks for sharing this perspective.",
            "This is exactly what I needed to hear.",
            "Have you considered escalating this to upper management?",
            "The same thing happened to me last year.",
            "Great advice, will definitely try this approach.",
            "This is unfortunately very common in the industry.",
            "You should document everything for future reference.",
        ]
        
        for post in posts[:30]:  # Comment on first 30 posts
            num_comments = random.randint(0, 4)
            for _ in range(num_comments):
                Comment.objects.create(
                    post=post,
                    author=random.choice(users),
                    content=random.choice(comment_templates)
                )

    def create_votes(self, users, posts):
        """Create sample votes on posts."""
        for post in posts:
            # Random subset of users vote on each post
            voters = random.sample(users, random.randint(1, min(8, len(users))))
            for user in voters:
                vote_type = 'upvote' if random.random() > 0.3 else 'downvote'
                Vote.objects.create(
                    post=post,
                    user=user,
                    vote=vote_type
                )
