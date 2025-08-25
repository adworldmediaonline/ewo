'use client';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import { replaceTextCharacters } from '@/lib/replaceTextCharacters';

import { debounce } from 'lodash';
import Form from 'next/form';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import SearchButton from './search-button';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7000';

interface Suggestion {
  slug: string;
  title: string;
  img?: string;
  finalPriceDiscount?: number;
}

interface SearchFormProps {
  inputRef?: React.RefObject<HTMLInputElement | null>;
  className?: string;
  placeholder?: string;
  hideButton?: boolean;
  buttonClassName?: string;
}

export default function SearchForm({
  inputRef,
  className = '',
  placeholder = 'Search for products...',
  hideButton = false,
  buttonClassName = '',
}: SearchFormProps): React.ReactElement {
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState<boolean>(false);
  const [searchText, setSearchText] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string>('');
  const suggestionsRef = React.useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Close suggestions when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      const target = event.target as Node;
      if (suggestionsRef.current && !suggestionsRef.current.contains(target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (term: string): Promise<void> => {
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
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      setSuggestions([]);
      setShowSuggestions(false);
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchSuggestions = React.useCallback(
    debounce(fetchSuggestions, 300),
    []
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
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
  const handleSuggestionClick = (slug: string): void => {
    setShowSuggestions(false);
    router.push(`/product/${slug}`);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchText.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchText.trim())}`);
    }
  };

  return (
    <div className="relative" ref={suggestionsRef}>
      <Form action="/search" onSubmit={handleSubmit}>
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

      {error && (
        <div className="absolute left-0 right-0 top-14 z-50 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {showSuggestions && (
        <div className="absolute left-0 right-0 top-14 z-50 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
          {message && suggestions.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">{message}</div>
          )}
          <div className="max-h-80 overflow-y-auto p-2">
            {suggestions.map(suggestion => (
              <button
                key={suggestion.slug}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleSuggestionClick(suggestion.slug)}
                type="button"
              >
                {suggestion.img ? (
                  <CloudinaryImage
                    src={suggestion.img}
                    alt={suggestion.title}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-md object-cover"
                    loading="lazy"
                    quality="auto"
                    format="auto"
                    crop="fill"
                    gravity="auto"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                    No image
                  </div>
                )}
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {replaceTextCharacters(suggestion.title, '*', '')}
                    </div>
                  </div>
                  {suggestion.finalPriceDiscount && (
                    <div className="shrink-0 text-sm font-semibold tracking-tight">
                      ${suggestion.finalPriceDiscount.toFixed(2)}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
