'use cache';

import { cacheLife } from 'next/cache';
import { API_ENDPOINT } from './api-endpoint';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ImageWithMeta {
  url: string;
  fileName: string;
  title: string;
  altText: string;
  /** Optional link to navigate when image is clicked (e.g. /shop, /about) */
  link?: string;
}

export interface HeroSectionContent {
  variant: 'image_only' | 'image_content' | 'content_only';
  image?: ImageWithMeta;
  heading?: string;
  description?: string;
  smallSubDescription?: string;
  cta?: { text: string; link: string };
  /** Mobile variant – separate image and content optimized for mobile */
  mobileImage?: ImageWithMeta;
  mobileHeading?: string;
  mobileDescription?: string;
  mobileSmallSubDescription?: string;
  mobileCta?: { text: string; link: string };
}

export interface PageSection {
  _id: string;
  pageSlug: string;
  sectionKey: string;
  sectionType: string;
  config: Record<string, unknown>;
  content: Record<string, unknown>;
  order: number;
  isActive: boolean;
}

export async function getActivePageSections(
  pageSlug: string
): Promise<PageSection[]> {
  cacheLife('hours');
  if (!API_BASE_URL || !pageSlug?.trim()) return [];

  try {
    const normalizedSlug = pageSlug.toLowerCase().trim();
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINT.PAGE_SECTIONS}/page/${normalizedSlug}/active`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return [];

    const json = await response.json();
    if (!json?.success || !Array.isArray(json?.data)) return [];

    return json.data as PageSection[];
  } catch (error) {
    console.error('Error fetching page sections:', error);
    return [];
  }
}
