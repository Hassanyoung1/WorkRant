'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { Company, CompanyFilters } from '@/types';


export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CompanyFilters>({
    sort_by: 'newest'
  });

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getCompanies(filters);
      const results = Array.isArray(data?.results) ? data.results : [];
      setCompanies(results);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleFilterChange = (key: keyof CompanyFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: ''
    }));
  };

  return (
    <div className="min-h-screen bg-[#f3e9df]">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" role="main">
        <div className="mb-10 border-b-2 border-[#241c19] pb-8">
          <p className="eyebrow text-[#9d4134]">Company index</p>
          <h1 className="display-title mt-4 text-5xl text-[#241c19] sm:text-6xl">The places people talk about after work.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#584944]">
            Search the names behind the job titles. Ratings are signals, not verdicts; the stories underneath are where the context lives.
          </p>
          
          {/* Anonymity Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-900">Information Notice</h3>
                <div className="mt-1 text-sm text-amber-800">
                  <p>Opinions expressed are anonymous and unverified. Company ratings reflect community sentiment only.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Search and Filters */}
                    {/* Search and Filters */}
          <div className="border border-[#cdb9aa] bg-[#fffaf7] p-6 mb-8">
            <h2 className="display-title text-3xl text-[#241c19] mb-5">Find the signal.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                  <label htmlFor="search" className="block text-sm font-semibold text-stone-900 mb-2">
                  Search Companies
                </label>
                <div className="relative">
                  <input
                    id="search"
                    type="search"
                    placeholder="Search by company name..."
                    className="input pr-10 focus:ring-2 focus:ring-orange-500"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    aria-describedby="search-help"
                  />
                  {filters.search && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-700 rounded-r-lg"
                      aria-label="Clear search"
                    >
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <p id="search-help" className="text-sm text-stone-500 mt-2">
                  Find companies by name
                </p>
              </div>
              
              <div>
                  <label htmlFor="industry" className="block text-sm font-semibold text-stone-900 mb-2">
                  Industry
                </label>
                <select
                  id="industry"
                  className="input focus:ring-2 focus:ring-orange-500"
                  value={filters.industry || ''}
                  onChange={(e) => handleFilterChange('industry', e.target.value)}
                  aria-describedby="industry-help"
                >
                  <option value="">All Industries</option>
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="consulting">Consulting</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
                <p id="industry-help" className="text-sm text-stone-500 mt-2">
                  Filter by industry sector
                </p>
              </div>
              
              <div>
                  <label htmlFor="sort" className="block text-sm font-semibold text-stone-900 mb-2">
                  Sort By
                </label>
                <select
                  id="sort"
                  className="input focus:ring-2 focus:ring-orange-500"
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value as CompanyFilters['sort_by'])}
                  aria-describedby="sort-help"
                >
                  <option value="newest">Recently Added</option>
                  <option value="highest_rated">Highest Rated</option>
                  <option value="most_posts">Most Discussed</option>
                </select>
                <p id="sort-help" className="text-sm text-stone-500 mt-2">
                  Order companies by criteria
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6" role="alert">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12" role="status" aria-live="polite">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" aria-hidden="true"></div>
            <p className="mt-2 text-stone-600">Loading companies...</p>
            <span className="sr-only">Loading companies, please wait.</span>
          </div>
        ) : (
          /* Companies Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="region" aria-label="Companies list">
            {Array.isArray(companies) && companies.length > 0 ? (
              companies.map((company) => (
                <article 
                  key={company.id} 
                  className="border border-[#cdb9aa] bg-[#fffaf7] p-6 transition hover:-translate-y-1 hover:shadow-[8px_10px_0_#d46a4a] focus-within:ring-2 focus-within:ring-[#9d4134]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="font-serif text-2xl font-semibold text-[#241c19] truncate pr-2">
                      {company.name}
                    </h2>
                    <div className="flex items-center ml-2 flex-shrink-0" aria-label={`Rating: ${company.average_rating?.toFixed(1) || 'Not rated'} out of 5`}>
                      <span className="text-[#9d4134]" aria-hidden="true">★</span>
                      <span className="text-sm text-stone-600 ml-1">
                        {company.average_rating ? company.average_rating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {company.description && (
                    <p className="text-stone-600 text-sm mb-4 line-clamp-3">
                      {company.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-stone-500 mb-4">
                    <span className="bg-stone-100 px-2 py-1 rounded text-xs font-medium text-stone-600">
                      {company.industry || 'Unspecified'}
                    </span>
                    <span aria-label={`${company.post_count || 0} posts about this company`}>
                      {company.post_count || 0} conversations
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t border-stone-200">
                    <Link 
                      href={`/posts?company=${company.id}`}
                      className="btn btn-primary w-full"
                      aria-label={`View posts about ${company.name}`}
                    >
                      View Posts
                    </Link>
                  </div>
                </article>
              ))
            ) : !loading && (
              <div className="col-span-full text-center py-12" role="status">
                <div className="max-w-md mx-auto">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-lg font-medium text-white mb-2">No Companies Found</h3>
                  <p className="text-gray-300">
                    {filters.search || filters.industry 
                      ? 'Try adjusting your search criteria to find more companies.'
                      : 'No companies have been added yet. Be the first to share your workplace experience!'
                    }
                  </p>
                  {(filters.search || filters.industry) && (
                    <button
                      onClick={() => setFilters({ sort_by: 'newest' })}
                      className="mt-4 text-orange-400 hover:text-orange-300 text-sm font-medium"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
