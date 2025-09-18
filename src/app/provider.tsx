'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { usePostHog } from 'posthog-js/react';

import { PostHogProvider as PHProvider } from 'posthog-js/react';
import posthog from 'posthog-js';
import { captureEvent } from '@/lib/posthog-client';
// import { cookieConsentGiven } from './banner';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PostHog
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
        person_profiles: 'identified_only',
        capture_pageleave: true,
        capture_exceptions: true,
        session_recording: {
          maskAllInputs: false,
          maskInputOptions: { password: true, email: true },
        },
        autocapture: {
          dom_event_allowlist: ['click', 'change', 'submit'],
          css_selector_allowlist: [
            '[data-ph-capture]',
            '.ph-capture',
            '[data-posthog-capture]'
          ],
        },
      });
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + '?' + searchParams.toString();
      }

      // Use our custom event tracking
      captureEvent('page_viewed', {
        page_path: pathname,
        page_url: url,
        search_params: searchParams.toString(),
      });
    }
  }, [pathname, searchParams]);

  return null;
}

function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
