'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

interface CompanySearchProps {
  onSelect: (companyName: string) => void;
  value: string;
  id?: string;
  name?: string;
}

interface Company {
  id: string;
  name: string;
}

export const CompanySearch: React.FC<CompanySearchProps> = ({ onSelect, value, id, name }) => {
  const [search, setSearch] = useState(value);
  const [suggestions, setSuggestions] = useState<Company[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  const searchCompanies = async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await apiService.searchCompanies(query);
      setSuggestions(results);
    } catch (err) {
      console.error('Error searching companies:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearch(query);
    onSelect(query); // Allow free text input
    setShowSuggestions(true);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchCompanies(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSelectSuggestion = (company: Company) => {
    setSearch(company.name);
    onSelect(company.name);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        className="mt-1 block w-full rounded-md border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 px-4 py-2"
        placeholder="Search for a company or enter a new one..."
        id={id}
        name={name}
      />
      
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-md shadow-lg border border-gray-700">
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-400">
              Searching...
            </div>
          ) : (
            <ul className="max-h-60 overflow-auto">
              {suggestions.map((company) => (
                <li
                  key={company.id}
                  onClick={() => handleSelectSuggestion(company)}
                  className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer"
                >
                  {company.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanySearch;
