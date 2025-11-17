'use client';

import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HeaderContactInfoProps {
  className?: string;
}

export function HeaderContactInfo({ className }: HeaderContactInfoProps) {
  const contactInfo = [
    {
      icon: Phone,
      label: 'Phone',
      value: '1-866-EWO-ROAD',
      valueSecondary: '(396-7623)',
      href: 'tel:+18663967623',
      ariaLabel: 'Call us at 1-866-EWO-ROAD',
      title: '1-866-EWO-ROAD (396-7623)',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'info@eastwestoffroad.com',
      href: 'mailto:info@eastwestoffroad.com',
      ariaLabel: 'Email us at info@eastwestoffroad.com',
      title: 'info@eastwestoffroad.com',
    },
  ];

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 md:gap-2 shrink-0',
        className
      )}
    >
      {contactInfo.map((contact) => {
        const Icon = contact.icon;
        return (
          <Link
            key={contact.label}
            href={contact.href}
            aria-label={contact.ariaLabel}
            title={contact.title}
            className="relative inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-accent transition-colors"
          >
            <Icon className="h-4 w-4 md:h-4 md:w-4" />
          </Link>
        );
      })}
    </div>
  );
}

export default HeaderContactInfo;

