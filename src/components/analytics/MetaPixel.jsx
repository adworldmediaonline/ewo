'use client';
import { useEffect } from 'react';
import Script from 'next/script';

export default function MetaPixel() {
  const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  useEffect(() => {
    if (!PIXEL_ID) {
      console.warn('Meta Pixel ID not found. Please set NEXT_PUBLIC_META_PIXEL_ID environment variable.');
      return;
    }

    // Install the Meta pixel base code
    if (typeof window !== 'undefined' && !window.fbq) {
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window,document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');

      // Initialize the pixel
      window.fbq('init', PIXEL_ID);
      // Track page view
      window.fbq('track', 'PageView');

      console.log('Meta Pixel initialized with ID:', PIXEL_ID);
    }
  }, [PIXEL_ID]);

  if (!PIXEL_ID) {
    return null;
  }

  return (
    <>
      {/* Meta Pixel noscript fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt="Meta Pixel"
        />
      </noscript>
    </>
  );
} 