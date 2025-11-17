
import { PRIMARY_LINKS } from '@/appdata/navigation';
import { Suspense } from 'react';

import DesktopNav from './desktop-nav';
import HeaderActions from './header-actions';
import HeaderBrand from './header-brand';
import HeaderMenuButton from './header-menu-button';
import HeaderSearch from './header-search-new';
import AnnouncementBar from './announcement-bar';
import HeaderContactInfo from './header-contact-info';
import { getCategoriesShow } from '@/server/categories';
import { getActiveAnnouncements } from '@/server/announcements';


export default async function HeaderV2() {
  "use cache";
  // Fetch categories and announcements - cached data
  const categories = await getCategoriesShow();
  const announcements = await getActiveAnnouncements();

  return (
    <>
      <div className="sticky top-0 z-50 w-full">
        {/* Announcement Bar - Above header */}
        {announcements.length > 0 && (
          <AnnouncementBar announcements={announcements} />
        )}

        {/* Main Header */}
        <header className="w-full bg-header text-header-foreground border-b border-border">
          <div className="container mx-auto px-3 md:px-6">
            {/* Top row */}
            <div className="flex h-16 md:h-28 items-center justify-between gap-2 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div className="md:hidden">
                  <HeaderMenuButton links={PRIMARY_LINKS} />
                </div>
                <HeaderBrand />
              </div>

              {/* Desktop navigation inline on the same row */}
              {/* DesktopNav uses usePathname() which accesses request-time data
                Even with interleaving pattern, hooks accessing runtime data need Suspense
                Categories are cached, so Suspense fallback rarely shows */}
              <div className="hidden md:block shrink-0">
                <Suspense
                  fallback={
                    <nav aria-label="Primary" className="hidden md:flex items-center gap-2">
                      <div className="h-6 w-16 animate-pulse rounded bg-muted"></div>
                      <div className="h-6 w-16 animate-pulse rounded bg-muted"></div>
                    </nav>
                  }
                >
                  <DesktopNav categories={categories || []} />
                </Suspense>
              </div>

              {/* Centered search grows to fill remaining space on desktop */}
              <div className="hidden md:flex flex-1 px-2 items-center gap-3">
                <HeaderSearch
                  className="w-full max-w-3xl mx-auto"
                />
              </div>

              {/* Mobile: Contact Info and Header Actions */}
              <div className="flex md:hidden items-center gap-1.5 shrink-0">

                <Suspense
                  fallback={
                    <div className="flex items-center gap-1.5">
                      <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
                      <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
                      <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
                    </div>
                  }
                >
                  <HeaderActions />
                </Suspense>
                <HeaderContactInfo />
              </div>

              {/* Desktop: Header Actions and Contact Info */}
              <div className="hidden md:flex items-center gap-2 shrink-0">
                {/* HeaderActions is a client component with hooks - wrap in Suspense */}
                <Suspense
                  fallback={
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <div className="h-8 w-8 md:h-9 md:w-9 animate-pulse rounded-full bg-muted"></div>
                      <div className="h-8 w-8 md:h-9 md:w-9 animate-pulse rounded-full bg-muted"></div>
                      <div className="h-8 w-8 md:h-9 md:w-9 animate-pulse rounded-full bg-muted"></div>
                    </div>
                  }
                >
                  <HeaderActions />
                </Suspense>
                {/* Contact Info - Compact, on right side of header actions */}
                <HeaderContactInfo />
              </div>
            </div>
            {/* Mobile search below the row */}
            <div className="md:hidden pb-3">
              <HeaderSearch className="w-full" />
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
