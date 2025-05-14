import './globals.scss';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GoogleTagManager } from '@next/third-parties/google';
import { Lato } from 'next/font/google';
import Providers from '@/components/provider';

export const metadata = {
  title: 'EWO',
  description: 'ewo',
  metadataBase: new URL('https://www.eastwestoffroad.com'),
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'AHQyQA4jdaD70HO9LxS57ddkUsBibZshkqwsM5-ysaI',
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
      <GoogleTagManager gtmId="GTM-MB34NG65" />
      <body className={`${lato.variable}`} suppressHydrationWarning>
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
