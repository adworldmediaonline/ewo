'use client';

import { Search as SearchIcon } from 'lucide-react';
import * as React from 'react';
import SearchForm from './search-form';

export interface HeaderSearchProps {
  inputRef?: React.RefObject<HTMLInputElement | null>;
  placeholder?: string;
  className?: string;
}

export function HeaderSearch({
  inputRef,
  placeholder = 'Search Product',
  className,
}: HeaderSearchProps): React.ReactElement {
  return (
    <div className={`relative ${className ?? ''}`}>
      <SearchIcon
        className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      {/* The input needs to look like a pill per the reference */}
      <SearchForm
        inputRef={inputRef}
        placeholder={placeholder}
        className="h-12 w-full rounded-full border border-border bg-background pl-12 pr-14 text-sm text-foreground placeholder:text-muted-foreground caret-primary outline-none ring-0 focus:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-header selection:bg-primary/20 selection:text-foreground"
        hideButton={true}
      />
    </div>
  );
}

export default HeaderSearch;
