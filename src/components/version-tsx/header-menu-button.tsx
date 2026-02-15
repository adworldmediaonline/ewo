'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

export interface HeaderMenuButtonProps {
  links: { href: string; label: string }[];
}

export function HeaderMenuButton({
  links,
}: HeaderMenuButtonProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);

  const handleLinkClick = React.useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
          <span className="hidden sm:inline">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <nav className="mt-4 grid gap-1" aria-label="Mobile menu">
          {links.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={handleLinkClick}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default HeaderMenuButton;
