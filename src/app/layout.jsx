import './globals.scss';
import './toast-fix.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GoogleTagManager } from '@next/third-parties/google';
import { Lato } from 'next/font/google';
import Providers from '@/components/provider';

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

// const body = Lato({
//   weight: ['300', '400', '700', '900'],
//   subsets: ['latin'],
//   variable: '--tp-ff-body',
// });
// const heading = Lato({
//   weight: ['300', '400', '700', '900'],
//   subsets: ['latin'],
//   variable: '--tp-ff-heading',
// });
// const p = Lato({
//   weight: ['300', '400', '700', '900'],
//   subsets: ['latin'],
//   variable: '--tp-ff-p',
// });
// const jost = Lato({
//   weight: ['300', '400', '700', '900'],
//   subsets: ['latin'],
//   variable: '--tp-ff-jost',
// });
// const roboto = Roboto({
//   weight: ['300', '400', '700', '900'],
//   subsets: ['latin'],
//   variable: '--tp-ff-roboto',
// });
// const oregano = Oregano({
//   weight: ['400'],
//   subsets: ['latin'],
//   variable: '--tp-ff-oregano',
// });
// const charm = Charm({
//   weight: ['400', '700'],
//   subsets: ['latin'],
//   variable: '--tp-ff-charm',
// });

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
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=595879356450357&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <GoogleTagManager gtmId="GTM-MB34NG65" />
      <body
        className={`${lato.variable} ${lato.className} antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
