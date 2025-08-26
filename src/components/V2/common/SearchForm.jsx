'use client';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import { replaceTextCharacters } from '@/lib/replaceTextCharacters';

import { debounce } from 'lodash';
import Form from 'next/form';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SearchButton from './SearchButton';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7000';

export default function SearchForm({
  inputRef,
  className = '',
  placeholder = 'Search for products...',
  hideButton = false,
  buttonClassName = '',
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const suggestionsRef = useRef(null);
  const router = useRouter();

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async term => {
    if (!term || term.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setMessage('');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setMessage('');

      const response = await fetch(
        `${API_URL}/api/product/suggestions?term=${encodeURIComponent(term)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data?.success) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
        setMessage(data.message || '');
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setMessage('');
      }
    } catch (error) {
      setError(error.message);
      setSuggestions([]);
      setShowSuggestions(false);
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedFetchSuggestions = useMemo(
    () => debounce(fetchSuggestions, 300),
    [fetchSuggestions]
  );

  // Handle input change
  const handleInputChange = e => {
    const value = e.target.value;
    setSearchText(value);
    if (value.trim()) {
      debouncedFetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = slug => {
    setShowSuggestions(false);
    router.push(`/product/${slug}`);
  };

  // Handle form submission
  const handleSubmit = e => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchText.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchText.trim())}`);
    }
  };

  return (
    <div className="" ref={suggestionsRef}>
      <Form action="/search" className="" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={searchText}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={className}
          autoComplete="off"
          aria-label="Search products"
        />
        {!hideButton && (
          <SearchButton className={buttonClassName} isLoading={isLoading} />
        )}
      </Form>

      {error && <div className="">{error}</div>}

      {showSuggestions && (
        <div className="">
          {message && suggestions.length === 0 && (
            <div className="">{message}</div>
          )}
          {suggestions.map(suggestion => (
            <div
              key={suggestion.slug}
              className=""
              onClick={() => handleSuggestionClick(suggestion.slug)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSuggestionClick(suggestion.slug);
                }
              }}
            >
              <div className="">
                {suggestion.img ? (
                  <CloudinaryImage
                    src={suggestion.img}
                    alt={suggestion.title}
                    width={50}
                    height={50}
                    className=""
                    loading="lazy"
                    quality="auto"
                    format="auto"
                    crop="fill"
                    gravity="auto"
                  />
                ) : (
                  <div className="">No Image</div>
                )}
                <div className="">
                  <div className="">
                    {replaceTextCharacters(suggestion.title, '*', '')}
                  </div>
                  {suggestion.finalPriceDiscount && (
                    <div className="">
                      ${suggestion.finalPriceDiscount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
