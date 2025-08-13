'use client';
import Image from 'next/image';
import Link from 'next/link';
// import logo from '@assets/img/logo/logo.webp';
import logo from '@assets/img/logo/logo.png';

export default function Footer() {
  return (
    <footer className="">
      <div className="">
        <div className="">
          {/* Logo and About */}
          <div className="">
            <div className="">
              <Link href="/">
                <Image
                  src={logo}
                  alt="EWO Logo"
                  width={180}
                  height={75}
                  className=""
                />
              </Link>
            </div>
            <div className="">
              <p className="">
                Join EWO ARMY today and become part of our exclusive community.
                Shop the latest trends with special member discounts.
              </p>
            </div>
          </div>

          {/* My Account */}
          <div className="">
            <h3 className="">My Account</h3>
            <ul className="">
              <li className="">
                <Link href="/profile" className="">
                  My Profile
                </Link>
              </li>
              <li className="">
                <Link href="/wishlist" className="">
                  Wishlist
                </Link>
              </li>
              <li className="">
                <Link href="/cart" className="">
                  Shopping Cart
                </Link>
              </li>
              <li className="">
                <Link href="/compare" className="">
                  Compare Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="">
            <h3 className="">Legal</h3>
            <ul className="">
              <li className="">
                <Link href="/terms" className="">
                  Terms & Conditions
                </Link>
              </li>
              <li className="">
                <Link href="/returns" className="">
                  Returns Policy
                </Link>
              </li>
              <li className="">
                <Link href="/history" className="">
                  History
                </Link>
              </li>
              <li className="">
                <Link href="/about" className="">
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="">
          <div className="">
            © {new Date().getFullYear()} EWO. All Rights Reserved.
          </div>
          <div className="">
            <span className="">Visa</span>
            <span className="">Mastercard</span>
            <span className="">Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
