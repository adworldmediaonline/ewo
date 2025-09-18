import Providers from '@/components/provider';

import { Toaster } from '@/components/ui/sonner';
import Wrapper from '@/components/wrapper';
import { GoogleTagManager } from '@next/third-parties/google';
import { Lato } from 'next/font/google';
import Image from 'next/image';
import Script from 'next/script';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import Footer from '../components/version-tsx/footer';
import HeaderWrapper from '../components/version-tsx/header-wrapper';
import ScrollToTop from '../components/version-tsx/scroll-to-top';
import './globals.css';
import { PostHogProvider } from './provider';

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
  weight: ['100', '300', '400', '700', '900'],
  subsets: ['latin'],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Meta Pixel Code */}
        <script
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
        <noscript>
          <Image
            height={1}
            width={1}
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=595879356450357&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <GoogleTagManager gtmId="GTM-MB34NG65" />
      <body
        className={`${lato.variable} ${lato.className} $antialiased flex min-h-screen flex-col`}
        suppressHydrationWarning
      >
        <ScrollToTop />
        {/* {quattrocento.variable} ${quattrocento.className} */}
        <PostHogProvider>
          <Providers>
            <Wrapper>
              <div className="flex flex-col min-h-screen">
                <HeaderWrapper />
                <main className="flex-grow">
                  <NuqsAdapter>{children}</NuqsAdapter>
                </main>
                <Footer />
              </div>
            </Wrapper>
          </Providers>
        </PostHogProvider>
        <Toaster richColors />

        {/* Tawk.to Script - Simple approach compatible with server components */}

        <Script
          id="tawk-to-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
                (function() {
                  if (typeof window === 'undefined') return;
                  if (window.Tawk_API) return;

                  try {
                    window.Tawk_API = window.Tawk_API || {};
                    window.Tawk_LoadStart = new Date();

                    var script = document.createElement('script');
                    script.async = true;
                    script.src = 'https://embed.tawk.to/68901758770617192577a56d/1j1pdmd5n';
                    script.charset = 'UTF-8';
                    script.setAttribute('crossorigin', '*');

                    script.onerror = function() {
                      console.warn('Failed to load Tawk.to script');
                    };

                    document.head.appendChild(script);
                  } catch (error) {
                    console.warn('Error initializing Tawk.to:', error);
                  }
                })();
              `,
          }}
        />
      </body>
    </html>
  );
}
