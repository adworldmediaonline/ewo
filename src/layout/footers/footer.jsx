'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import logo from '@assets/img/logo/logo.jpg';
import styles from './footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          {/* Logo and About */}
          <div className={styles.footerColumn}>
            <div className={styles.footerLogo}>
              <Link href="/">
                <Image
                  src={logo}
                  alt="EWO Logo"
                  width={180}
                  height={75}
                  className={styles.footerLogoImage}
                />
              </Link>
            </div>
            <div className={styles.footerAbout}>
              <p className={styles.footerAboutText}>
                Join EWO ARMY today and become part of our exclusive community.
                Shop the latest trends with special member discounts.
              </p>
            </div>
          </div>

          {/* My Account */}
          <div className={styles.footerColumn}>
            <h3 className={styles.footerTitle}>My Account</h3>
            <ul className={styles.footerLinks}>
              <li className={styles.footerLink}>
                <Link href="/profile" className={styles.footerLinkAnchor}>
                  My Profile
                </Link>
              </li>
              <li className={styles.footerLink}>
                <Link href="/wishlist" className={styles.footerLinkAnchor}>
                  Wishlist
                </Link>
              </li>
              <li className={styles.footerLink}>
                <Link href="/cart" className={styles.footerLinkAnchor}>
                  Shopping Cart
                </Link>
              </li>
              <li className={styles.footerLink}>
                <Link href="/compare" className={styles.footerLinkAnchor}>
                  Compare Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className={styles.footerColumn}>
            <h3 className={styles.footerTitle}>Legal</h3>
            <ul className={styles.footerLinks}>
              <li className={styles.footerLink}>
                <Link href="#" className={styles.footerLinkAnchor}>
                  Terms & Conditions
                </Link>
              </li>
              <li className={styles.footerLink}>
                <Link href="#" className={styles.footerLinkAnchor}>
                  Privacy Policy
                </Link>
              </li>
              <li className={styles.footerLink}>
                <Link href="#" className={styles.footerLinkAnchor}>
                  Returns Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div className={styles.footerColumn}>
            <h3 className={styles.footerTitle}>Help</h3>
            <ul className={styles.footerLinks}>
              <li className={styles.footerLink}>
                <Link href="#" className={styles.footerLinkAnchor}>
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} EWO. All Rights Reserved.
          </div>
          <div className={styles.paymentMethods}>
            <span className={styles.paymentCard}>Visa</span>
            <span className={styles.paymentCard}>Mastercard</span>
            <span className={styles.paymentCard}>Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
