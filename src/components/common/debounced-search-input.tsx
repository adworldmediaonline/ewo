'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

interface DebouncedSearchInputProps {
  initialValue?: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  disabled?: boolean;
}

const DebouncedSearchInput = ({
  initialValue = '',
  onSearchChange,
  placeholder = 'Search...',
  className = '',
  debounceMs = 350,
  disabled = false,
}: DebouncedSearchInputProps) => {
  const [searchValue, setSearchValue] = useState(initialValue);

  // Sync with external changes
  useEffect(() => {
    setSearchValue(initialValue);
  }, [initialValue]);

  // Debounce search commits
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue.trim() !== initialValue) {
        onSearchChange(searchValue.trim());
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchValue, initialValue, onSearchChange, debounceMs]);

  return (
    <Input
      type="search"
      value={searchValue}
      onChange={event => setSearchValue(event.target.value)}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      aria-label="Search products"
    />
  );
};

export default DebouncedSearchInput;

