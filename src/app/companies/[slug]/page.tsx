'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';
import PostSkeleton from '@/components/PostSkeleton';
import { apiService } from '@/lib/api';
import { Company, Post } from '@/types';

export default function CompanyDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [company, setCompany] = useState<Company | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyAndPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all companies and find by slug
        const companiesData = await apiService.getCompanies();
        const results = Array.isArray(companiesData?.results) ? companiesData.results : [];
        const foundCompany = results.find((c: Company) => c.slug === slug);
        
        if (!foundCompany) {
          setError('Company not found');
          setLoading(false);
          return;
        }
        
        setCompany(foundCompany);
        
        // Fetch posts for this company
        const postsData = await apiService.getPosts({ company: foundCompany.id });
        setPosts(postsData.results || []);
      } catch (err) {
        console.error('Error fetching company:', err);
        setError(err instanceof Error ? err.message : 'Failed to load company');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCompanyAndPosts();
    }
  }, [slug]);

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    try {
      await apiService.voteOnPost(postId, voteType);
      // Refresh posts
      if (company) {
        const postsData = await apiService.getPosts({ company: company.id });
        setPosts(postsData.results || []);
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3e9df]">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3 mb-8"></div>
            </div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-[#f3e9df]">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
              <div className="bg-[#fffaf7] border border-[#cdb9aa] p-8 text-center">
              <h2 className="display-title text-3xl text-[#241c19] mb-2">Company not found.</h2>
              <p className="text-[#584944] mb-4">
                {error || 'The company you are looking for does not exist.'}
              </p>
              <Link
                href="/companies"
                className="btn btn-primary"
              >
                Browse Companies
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3e9df]">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <Link href="/companies" className="eyebrow text-[#9d4134] hover:text-[#713229]">
              Companies
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-300">{company.name}</span>
          </nav>

          {/* Company Header */}
          {/* Company Header */}
          <div className="bg-[#fffaf7] border border-[#cdb9aa] p-8 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="eyebrow text-[#9d4134]">Company conversation</p>
                <h1 className="display-title mt-3 text-5xl text-[#241c19]">{company.name}</h1>
                {company.industry && (
                  <span className="inline-block border border-[#cdb9aa] text-[#6e5b52] text-xs uppercase tracking-[0.14em] px-3 py-1">
                    {company.industry}
                  </span>
                )}
              </div>
              <div className="flex items-center">
                {company.average_rating !== undefined && company.average_rating !== null && (
                  <div className="flex items-center">
                    <span className="text-[#9d4134] text-2xl mr-2">★</span>
                    <span className="text-2xl font-bold text-[#241c19]">
                      {company.average_rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-[#6e5b52] ml-1">/5</span>
                  </div>
                )}
              </div>
            </div>

            {company.description && (
              <p className="text-[#584944] mb-6">{company.description}</p>
            )}

            <div className="flex items-center gap-6 text-sm text-gray-400 pt-4 border-t border-gray-800">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>{company.post_count || 0} posts</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-orange-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-orange-900">Information Notice</h3>
                <p className="text-sm text-orange-800 mt-1">
                  Opinions expressed are anonymous and unverified. Posts reflect individual experiences only.
                </p>
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="mb-6">
            <h2 className="display-title text-4xl text-[#241c19] mb-4">
              Posts about {company.name}
            </h2>
          </div>

          {posts.length === 0 ? (
            <div className="bg-[#fffaf7] p-12 text-center border border-[#cdb9aa]">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <h3 className="display-title text-3xl text-[#241c19] mb-2">No posts yet.</h3>
              <p className="text-[#584944] mb-6">
                Be the first to share your experience working at {company.name}
              </p>
              <Link
                href="/create"
                className="btn btn-primary"
              >
                Share Your Experience
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onVote={handleVote}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
