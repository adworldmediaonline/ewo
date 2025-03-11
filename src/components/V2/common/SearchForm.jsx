'use client';
import Form from 'next/form';
import styles from '@/styleModules/Search.module.css';
import SearchButton from './SearchButton';
import { useCallback, useState, useRef, useEffect } from 'react';
import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7000';

export default function SearchForm({ inputRef }) {
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

  const fetchSuggestions = async term => {
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

      console.log('Fetching suggestions for:', term);
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
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Suggestions response:', data);

      if (data?.success) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
        setMessage(data.message || '');
      } else {
        console.warn('Invalid response format:', data);
        setSuggestions([]);
        setShowSuggestions(false);
        setMessage('');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message);
      setSuggestions([]);
      setShowSuggestions(false);
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 300),
    []
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
    <div className={styles.searchContainer} ref={suggestionsRef}>
      <Form
        action="/search"
        className={styles.searchForm}
        onSubmit={handleSubmit}
      >
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={searchText}
          onChange={handleInputChange}
          placeholder="Search for products..."
          className={styles.searchInput}
          autoComplete="off"
          aria-label="Search products"
        />
        <SearchButton className={styles.searchButton} isLoading={isLoading} />
      </Form>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {showSuggestions && (
        <div className={styles.suggestionsContainer}>
          {message && suggestions.length === 0 && (
            <div className={styles.noResults}>{message}</div>
          )}
          {suggestions.map(suggestion => (
            <div
              key={suggestion.slug}
              className={styles.suggestionItem}
              onClick={() => handleSuggestionClick(suggestion.slug)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSuggestionClick(suggestion.slug);
                }
              }}
            >
              <div className={styles.suggestionContent}>
                {suggestion.img ? (
                  <img
                    src={suggestion.img}
                    alt={suggestion.title}
                    className={styles.suggestionImage}
                    loading="lazy"
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = '/images/placeholder.png';
                    }}
                  />
                ) : (
                  <div className={styles.noImage}>No Image</div>
                )}
                <div className={styles.suggestionInfo}>
                  <div className={styles.suggestionTitle}>
                    {suggestion.title}
                  </div>
                  {suggestion.price && (
                    <div className={styles.suggestionPrice}>
                      ${suggestion.price.toFixed(2)}
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
