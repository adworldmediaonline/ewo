import Providers from '@/components/provider';
import { Analytics } from '@vercel/analytics/next';

import { Toaster } from '@/components/ui/sonner';
import Wrapper from '@/components/wrapper';
import { GoogleTagManager } from '@next/third-parties/google';
import { Lato } from 'next/font/google';
import Script from 'next/script';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Suspense } from 'react';
import Footer from '../components/version-tsx/footer';
import HeaderWrapper from '../components/version-tsx/header-wrapper';
import './globals.css';

export const metadata = {
  title: 'East West Off Road | Premium Automotive & Off-Road Gear USA',
  description:
    'Discover high-performance automotive & off-road parts at East West Offroad (EWO) USA! 🛠️ Durable, reliable, and adventure-ready gear for trucks, Jeeps & 4x4s. Shop now for exclusive deals!',

  keywords:
    'Automotive off-road parts USA, East West Offroad EWO, Jeep & truck accessories, Best off-road gear 2024, 4x4 performance upgrades, Durable automotive parts, Off-road suspension kits, Adventure-ready truck mods, USA-made off-road equipment, Top-rated automotive upgrades, hd crossover steering kit',

  metadataBase: new URL('https://www.eastwestoffroad.com'),
  alternates: {
    canonical: '/',
  },
  verification: {
    google: [
      'AHQyQA4jdaD70HO9LxS57ddkUsBibZshkqwsM5-ysaI',
      'KtfBPHXUteAAcuGWewRT3kzZR53tW14l96CnMy7PNLY',
    ],
  },
};

const lato = Lato({
  variable: '--font-lato',
  weight: ['300', '400', '700'], // Reduced from 5 weights to 3 essential weights
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
  preload: true, // Preload primary font for faster rendering
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to image CDNs for faster LCP */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://i.ibb.co" />

        {/* DNS prefetch for third-party scripts */}
        <link rel="dns-prefetch" href="https://connect.facebook.net" />

        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body
        className={`${lato.variable} ${lato.className} antialiased flex min-h-screen flex-col`}
        suppressHydrationWarning
      >
        <Providers>
          <Suspense fallback={null}>
            <Wrapper>
              <div className="flex flex-col min-h-screen">
                <HeaderWrapper />
                <main className="grow">
                  <NuqsAdapter>{children}</NuqsAdapter>
                </main>
                <Footer />
              </div>
            </Wrapper>
          </Suspense>
        </Providers>

        <Toaster richColors />

        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '595879356450357');
              fbq('track', 'PageView');
            `,
          }}
        />



        <GoogleTagManager gtmId="GTM-MB34NG65" />
        <Analytics />
      </body>
    </html>
  );
}
