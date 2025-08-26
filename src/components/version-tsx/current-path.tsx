'use client';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';
import TawkToChat from '../tawk-to-chat';

export default function CurrentPath({
  children: _children,
}: PropsWithChildren) {
  const pathname = usePathname();

  const content = () => {
    switch (pathname) {
      case '/':
        return <TawkToChat />;
      case '/about':
        return <TawkToChat />;
      case '/contact':
        return <TawkToChat />;
      default:
        return null;
    }
  };
  return <div>{content()}</div>;
}
