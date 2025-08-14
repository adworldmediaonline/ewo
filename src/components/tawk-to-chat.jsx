'use client';

import { useEffect, useState } from 'react';
import ChatSkeleton from './chat-skeleton';

export default function TawkToChat() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const propertyId = process.env.NEXT_PUBLIC_TAWK_TO_CHAT_PROPERTY_ID;
    const widgetId = process.env.NEXT_PUBLIC_TAWK_TO_CHAT_WIDGET_ID;
    if (!propertyId || !widgetId) {
      // Missing config, do not attempt to load
      setIsLoading(false);
      return;
    }

    // Initialize global API object once
    // eslint-disable-next-line no-undef
    window.Tawk_API = window.Tawk_API || {};
    // eslint-disable-next-line no-undef
    window.Tawk_LoadStart = new Date();

    const handleLoad = () => {
      setIsLoading(false);
      try {
        // eslint-disable-next-line no-undef
        if (window.Tawk_API) {
          // Raise z-index of sheet via CSS already, but also hide widget when cart opens
          // eslint-disable-next-line no-undef
          window.Tawk_API.onChatMinimized = function () {};
        }
      } catch {}
    };
    // Attach basic callbacks if needed
    // eslint-disable-next-line no-undef
    window.Tawk_API.onLoad = handleLoad;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);

    return () => {
      try {
        document.body.removeChild(script);
      } catch {}
      // eslint-disable-next-line no-undef
      if (window.Tawk_API) {
        // Clean up callbacks
        // eslint-disable-next-line no-undef
        delete window.Tawk_API.onLoad;
      }
    };
  }, []);

  return isLoading ? <ChatSkeleton /> : null;
}
