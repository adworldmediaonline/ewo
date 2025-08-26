# Performance Optimization Architecture

## Overview

This document outlines the performance optimizations implemented to reduce data fetching time from 5-7 seconds to near-instant loading.

## Key Changes

### 1. Server-Side Data Fetching

- **Before**: Client-side RTK Query calls in both header and home page
- **After**: Server-side fetching with Next.js Data Cache
- **Benefit**: Eliminates duplicate API calls and client-side fetch delays

### 2. Data Layer Architecture

```
src/lib/server-data.ts          # Server-side data fetching functions
src/components/header-wrapper.tsx # Server component wrapper
src/components/header.tsx        # Client component (receives data as props)
src/app/page.jsx                 # Server component (fetches and passes data)
```

### 3. Caching Strategy

- **Next.js Data Cache**: 5-minute cache for categories
- **Tag-based Invalidation**: Use `revalidateTag('categories')` to clear cache
- **Automatic Deduplication**: Next.js prevents duplicate fetch calls during render

## Performance Improvements

### Before (Client-Side)

- Header: 5-7s delay waiting for API
- Home page: 5-7s delay waiting for API
- Total: 2 separate API calls, 5-7s total delay

### After (Server-Side)

- Header: Instant render (data pre-fetched)
- Home page: Instant render (data pre-fetched)
- Total: 1 API call, cached for 5 minutes

## Implementation Details

### Server Data Functions

```typescript
// src/lib/server-data.ts
export const getCategories = unstable_cache(
  async (): Promise<CategoryItem[]> => {
    const data = await fetchFromAPI<{ result: CategoryItem[] }>(
      '/api/category/show'
    );
    return data.result?.filter(/* ... */) || [];
  },
  ['categories-data'],
  {
    revalidate: 300, // 5 minutes
    tags: ['categories'],
  }
);
```

### Component Updates

```typescript
// Server component fetches data
export default async function HomePage() {
  const categories = await getCategories(); // Cached, deduplicated
  return <CategoryShowcase categories={categories} />;
}

// Client component receives data as props
export default function CategoryShowcase({
  categories,
}: CategoryShowcaseProps) {
  // No API calls, instant render
}
```

## Cache Management

Next.js automatically manages the cache with the configured revalidation time (5 minutes for categories). The cache is automatically cleared when:

- The revalidation time expires
- The server restarts
- The cache is manually cleared

## Monitoring

Performance improvements can be monitored through:

- Browser DevTools Network tab (reduced API calls)
- Lighthouse performance scores
- Core Web Vitals improvements
- Reduced Time to First Contentful Paint (FCP)

## Best Practices

1. **Server Components First**: Use Server Components for above-the-fold data
2. **Client Components for Interactivity**: Keep RTK Query for forms, mutations
3. **Cache Strategically**: Cache static data longer, dynamic data shorter
4. **Monitor Performance**: Use performance hooks to track improvements
5. **Tag-based Invalidation**: Use specific tags for granular cache control

## Migration Guide

### For New Components

1. Create server data function in `src/lib/server-data.ts`
2. Fetch data in Server Component
3. Pass data as props to Client Components

### For Existing Components

1. Move data fetching to server layer
2. Convert to receive data as props
3. Remove RTK Query calls

## Future Enhancements

1. **Streaming**: Implement React Suspense for progressive loading
2. **Prefetching**: Prefetch data for likely user paths
3. **Edge Caching**: Use CDN for global performance
4. **Analytics**: Track cache hit rates and performance metrics
