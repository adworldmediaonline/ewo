// Server Component - Footer with static content
// Using hardcoded year for Cache Components compatibility
import logo from '@assets/img/logo/logo.png';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  // Hardcoded year - no need for connection() or new Date()
  const currentYear = 2025;

  return (
    <footer
      aria-labelledby="footer-heading"
      className="bg-header text-header-foreground border-t border-border"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container mx-auto px-3 md:px-6">
        {/* Top section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-10">
          {/* Logo and About */}
          <div>
            <div className="mb-4">
              <Link href="/" aria-label="Go to homepage">
                <Image
                  src={logo}
                  alt="EWO Logo"
                  width={180}
                  height={75}
                  className="h-auto w-[150px] sm:w-[170px] md:w-[180px] object-contain"
                />
              </Link>
            </div>
            <div className="max-w-md">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Join EWO ARMY today and become part of our exclusive community.
                Shop the latest trends with special member discounts.
              </p>
            </div>
          </div>

          {/* My Account */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-primary-foreground/90">
              My Account
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/profile"
                  className="text-muted-foreground hover:text-primary-foreground"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="text-muted-foreground hover:text-primary-foreground"
                >
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-muted-foreground hover:text-primary-foreground"
                >
                  Shopping Cart
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/compare"
                  className="text-muted-foreground hover:text-primary-foreground"
                >
                  Compare Products
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-primary-foreground/90">
              Legal
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary-foreground"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-muted-foreground hover:text-primary-foreground"
                >
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-muted-foreground hover:text-primary-foreground"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="text-muted-foreground hover:text-primary-foreground"
                >
                  History
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary-foreground"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment/CTA placeholder keeps layout balanced */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold tracking-wide text-primary-foreground/90">
              Payments
            </h3>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground">
                Visa
              </span>
              <span className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground">
                Mastercard
              </span>
              <span className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground">
                Stripe
              </span>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border py-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            © {currentYear} EWO. All Rights Reserved.
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="sr-only">Accepted payments:</span>
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
