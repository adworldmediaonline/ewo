'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import useSticky from '@/hooks/use-sticky';
import useCartInfo from '@/hooks/use-cart-info';
import { openCartMini } from '@/redux/features/cartSlice';
import CartMiniSidebar from '@/components/common/cart-mini-sidebar';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
// import logo from '@assets/img/logo/logo.webp';
import logo from '@assets/img/logo/logo.jpeg';
import { CartTwo, Close, Compare, Menu, Search, User, Wishlist } from '@/svg';
import styles from './HeaderV2.module.css';
import { useRouter } from 'next/navigation';
import SearchForm from '@/components/V2/common/SearchForm';

export default function HeaderV2() {
  const { wishlist } = useSelector(state => state.wishlist);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState(null);
  const { quantity } = useCartInfo();
  const { sticky } = useSticky();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const prevScrollPos = useRef(0);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } =
    useGetShowCategoryQuery();

  // Simple and effective scroll handling
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const scrollDelta = currentScrollPos - prevScrollPos.current;

      // Don't do anything at the very top of the page
      if (currentScrollPos < 50) {
        setIsHeaderHidden(false);
        prevScrollPos.current = currentScrollPos;
        return;
      }

      // Going down = hide, going up = show
      if (scrollDelta > 10) {
        setIsHeaderHidden(true);
      } else if (scrollDelta < -10) {
        setIsHeaderHidden(false);
      }

      prevScrollPos.current = currentScrollPos;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownKeyDown = e => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      dropdownButtonRef.current?.focus();
    }
  };

  const handleClickOutside = event => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      !dropdownButtonRef.current?.contains(event.target)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle category navigation
  const handleCategoryNavigation = category => {
    router.push(`/category?id=${category._id}`);
    setIsDropdownOpen(false);
  };

  // Handle category route for mobile
  const handleCategoryRoute = title => {
    router.push(
      `/shop?category=${title
        .toLowerCase()
        .replace('&', '')
        .split(' ')
        .join('-')}`
    );
    setIsMobileNavOpen(false);
  };

  const handleChildCategoryRoute = (parent, child) => {
    router.push(
      `/shop?category=${parent
        .toLowerCase()
        .replace('&', '')
        .split(' ')
        .join('-')}&subCategory=${child
        .toLowerCase()
        .replace('&', '')
        .split(' ')
        .join('-')}`
    );
    setIsMobileNavOpen(false);
  };

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsMobileSearchOpen(false);
  }, []);

  // Filter categories to only show ones with products and status 'Show'
  const filteredCategories =
    categories?.result?.filter(
      cat => cat.products?.length > 0 && cat.status === 'Show'
    ) || [];

  // Toggle mobile category
  const toggleMobileCategory = categoryId => {
    setActiveMobileCategory(
      activeMobileCategory === categoryId ? null : categoryId
    );
  };

  // Handle mobile search open
  const handleMobileSearchOpen = () => {
    setIsMobileSearchOpen(true);
    // Use setTimeout to ensure the input is mounted before focusing
    setTimeout(() => {
      mobileSearchInputRef.current?.focus();
    }, 100);
  };

  return (
    <div className={styles.headerWrapper}>
      <div
        className={`${styles.headerContainer} ${
          sticky ? styles.stickyActive : ''
        } ${isHeaderHidden ? styles.headerHidden : ''}`}
      >
        <header className={styles.header}>
          <div className={styles.container}>
            <div className={styles.headerTop}>
              {/* Logo */}
              <Link href="/">
                <Image src={logo} alt="logo" width={190} priority />
              </Link>

              {/* Desktop Search */}
              <div className={styles.searchContainer}>
                <SearchForm />
              </div>

              {/* Action Buttons */}
              <div className={styles.actions}>
                <button
                  className={styles.searchButton}
                  onClick={handleMobileSearchOpen}
                >
                  <Search />
                </button>

                <Link href="/compare" className={styles.actionButton}>
                  <Compare />
                </Link>

                <Link href="/wishlist" className={styles.actionButton}>
                  <Wishlist />
                  {wishlist.length > 0 && (
                    <span className={styles.actionBadge}>
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                <button
                  className={styles.actionButton}
                  onClick={() => dispatch(openCartMini())}
                >
                  <CartTwo />
                  {quantity > 0 && (
                    <span className={styles.actionBadge}>{quantity}</span>
                  )}
                </button>

                <Link href="/profile" className={styles.actionButton}>
                  <User />
                </Link>

                <button
                  className={`${styles.actionButton} ${styles.mobileMenu}`}
                  onClick={() => setIsMobileNavOpen(true)}
                >
                  <Menu />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Secondary Navigation */}
        <div className={styles.headerBottom}>
          <nav className={styles.bottomNav}>
            <ul className={styles.bottomNavList}>
              <li>
                <Link href="/" className={styles.bottomNavLink}>
                  HOME
                </Link>
              </li>
              <li>
                <button
                  ref={dropdownButtonRef}
                  className={`${styles.bottomNavLink} ${styles.dropdownButton}`}
                  onClick={handleDropdownToggle}
                  aria-expanded={isDropdownOpen}
                  aria-controls="shop-dropdown"
                  aria-haspopup="true"
                >
                  SHOP
                  <span className={styles.dropdownIcon}>▼</span>
                  <span className={styles.srOnly}>
                    {isDropdownOpen ? 'Close menu' : 'Open menu'}
                  </span>
                </button>

                <div
                  id="shop-dropdown"
                  className={styles.dropdownContent}
                  aria-hidden={!isDropdownOpen}
                  role="menu"
                  onKeyDown={handleDropdownKeyDown}
                  ref={dropdownRef}
                >
                  <ul className={styles.simpleDropdownList} role="none">
                    {filteredCategories.map(category => (
                      <li
                        key={category._id}
                        className={styles.simpleDropdownItem}
                        role="none"
                      >
                        <button
                          className={styles.simpleDropdownButton}
                          onClick={() => handleCategoryNavigation(category)}
                          role="menuitem"
                        >
                          {category.parent}
                          <span className={styles.productCount}>
                            ({category.products.length})
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
              <li>
                <Link href="/shop" className={styles.bottomNavLink}>
                  PRODUCTS
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Search */}
      <div
        className={`${styles.mobileSearch} ${
          isMobileSearchOpen ? styles.mobileSearchActive : ''
        }`}
      >
        <div className={styles.mobileSearchHeader}>
          <button
            className={styles.mobileSearchClose}
            onClick={() => setIsMobileSearchOpen(false)}
          >
            <Close />
          </button>
          <SearchForm inputRef={mobileSearchInputRef} />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`${styles.mobileNav} ${
          isMobileNavOpen ? styles.mobileNavActive : ''
        }`}
      >
        <div className={styles.mobileNavHeader}>
          <Image src={logo} alt="logo" width={100} priority />
          <button
            className={styles.actionButton}
            onClick={() => setIsMobileNavOpen(false)}
          >
            <Close />
          </button>
        </div>
        <div className={styles.mobileNavContent}>
          <ul className={styles.mobileNavigation}>
            <li>
              <Link
                href="/"
                className={styles.navLink}
                onClick={() => setIsMobileNavOpen(false)}
              >
                HOME
              </Link>
            </li>
            <li>
              <Link
                href="/shop"
                className={styles.navLink}
                onClick={() => setIsMobileNavOpen(false)}
              >
                SHOP
              </Link>
              {filteredCategories.map(category => (
                <div key={category._id} className={styles.mobileCategory}>
                  {category.children && category.children.length > 0 ? (
                    <>
                      <button
                        className={styles.mobileCategoryHeader}
                        onClick={() => toggleMobileCategory(category._id)}
                        aria-expanded={activeMobileCategory === category._id}
                      >
                        <span className={styles.mobileCategoryTitle}>
                          {category.parent}
                        </span>
                        <svg
                          className={`${styles.mobileDropdownIcon} ${
                            activeMobileCategory === category._id
                              ? styles.active
                              : ''
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <div
                        className={`${styles.mobileSubCategories} ${
                          activeMobileCategory === category._id
                            ? styles.active
                            : ''
                        }`}
                      >
                        {category.children?.map((child, index) => (
                          <button
                            key={index}
                            className={styles.subCategoryLink}
                            onClick={() =>
                              handleChildCategoryRoute(category.parent, child)
                            }
                          >
                            {child}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <button
                      className={styles.mobileCategoryHeader}
                      onClick={() => handleCategoryRoute(category.parent)}
                    >
                      <span className={styles.mobileCategoryTitle}>
                        {category.parent}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </li>
            <li>
              <Link
                href="/shop"
                className={styles.navLink}
                onClick={() => setIsMobileNavOpen(false)}
              >
                PRODUCTS
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Cart Mini Sidebar */}
      <CartMiniSidebar />
    </div>
  );
}
