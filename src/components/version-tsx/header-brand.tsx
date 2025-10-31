

import logo from '@assets/img/logo/logo.png';
import Image from 'next/image';
import Link from 'next/link';
import { ReactElement } from 'react';

export interface HeaderBrandProps {
  href?: string;
  ariaLabel?: string;
}

export function HeaderBrand({
  href = '/',
  ariaLabel = 'Go to homepage',
}: HeaderBrandProps): ReactElement {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="inline-flex items-center py-4"
    >
      <Image
        src={logo}
        alt="EWO logo"
        priority
        placeholder="blur"
        width={(logo as unknown as { width: number }).width}
        height={(logo as unknown as { height: number }).height}
        sizes="(max-width: 480px) 160px, (max-width: 768px) 200px, 260px"
        className="h-[52px] sm:h-[64px] md:h-[110px] w-auto object-contain"
      />
    </Link>
  );
}

export default HeaderBrand;
