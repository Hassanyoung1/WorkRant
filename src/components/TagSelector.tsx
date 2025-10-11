'use client';

import React, { useState } from 'react';

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  id?: string;
  name?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({ value, onChange, suggestions = [], id, name }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.toLowerCase();
    setInput(text);
    setShowSuggestions(true);
  };

  const handleAddTag = (tag: string) => {
    if (!tag) return;
    
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !value.includes(normalizedTag)) {
      onChange([...value, normalizedTag]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      !value.includes(suggestion) && 
      suggestion.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 border-2 border-gray-700 rounded-md bg-gray-800 min-h-[42px]">
        {value.map(tag => (
          <span 
            key={tag}
            className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-orange-900 text-orange-100"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 text-orange-300 hover:text-orange-100"
              aria-label={`Remove ${tag} tag`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTag(input);
            }
          }}
          className="flex-1 min-w-[120px] border-0 p-0 focus:ring-0 text-sm bg-transparent text-white placeholder-gray-500"
          placeholder={value.length === 0 ? "Add tags..." : ""}
          id={id}
          name={name}
          aria-label="Add tags"
          aria-controls="tag-suggestions"
          role="combobox"
          aria-expanded={showSuggestions ? 'true' : 'false'}
          aria-autocomplete="list"
        />
      </div>

      {showSuggestions && input && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-md shadow-lg border border-gray-700">
          <ul className="max-h-60 overflow-auto py-1">
            {filteredSuggestions.map(suggestion => (
              <li
                key={suggestion}
                onClick={() => handleAddTag(suggestion)}
                className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TagSelector;
