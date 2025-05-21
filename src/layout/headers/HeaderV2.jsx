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
import logo from '@assets/img/logo/logo.png';
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
  const mainDropdownButtonRef = useRef(null);
  const stickyDropdownButtonRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const prevScrollPos = useRef(0);
  const [activeDropdownButton, setActiveDropdownButton] = useState(null);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } =
    useGetShowCategoryQuery();

  // Simple and effective scroll handling
  useEffect(() => {
    let lastTime = 0;
    const throttleDelay = 100; // 100ms throttle for better performance

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastTime < throttleDelay) return;
      lastTime = now;

      const currentScrollPos = window.scrollY;
      const scrollDelta = currentScrollPos - prevScrollPos.current;

      // Show sticky header when scrolling past threshold
      if (currentScrollPos > 200) {
        setShowStickyHeader(true);
      } else {
        setShowStickyHeader(false);
      }

      prevScrollPos.current = currentScrollPos;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDropdownToggle = buttonType => {
    setActiveDropdownButton(buttonType);
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownKeyDown = e => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      if (activeDropdownButton === 'main') {
        mainDropdownButtonRef.current?.focus();
      } else {
        stickyDropdownButtonRef.current?.focus();
      }
    }
  };

  // Close dropdown when clicking outside
  const handleClickOutside = event => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      !mainDropdownButtonRef.current?.contains(event.target) &&
      !stickyDropdownButtonRef.current?.contains(event.target)
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

  // Add a closeSearch function
  const closeSearch = () => {
    setIsMobileSearchOpen(false);
  };

  // Create a navigation component that can be reused
  const renderNavLinks = (
    linkClassName,
    navListClassName,
    containerClassName,
    isSticky = false
  ) => (
    <div className={containerClassName || ''}>
      <ul className={navListClassName}>
        <li>
          <Link href="/" className={linkClassName}>
            HOME
          </Link>
        </li>
        <li>
          <button
            ref={isSticky ? stickyDropdownButtonRef : mainDropdownButtonRef}
            className={`${linkClassName} ${styles.dropdownButton}`}
            onClick={() => handleDropdownToggle(isSticky ? 'sticky' : 'main')}
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
        </li>
        <li>
          <Link href="/shop" className={linkClassName}>
            PRODUCTS
          </Link>
        </li>
      </ul>
    </div>
  );

  // Get dropdown position based on active button
  const getDropdownPosition = () => {
    if (!isDropdownOpen) return {};

    if (activeDropdownButton === 'sticky') {
      const buttonRect =
        stickyDropdownButtonRef.current?.getBoundingClientRect();
      if (buttonRect) {
        return {
          position: 'fixed',
          top: `${buttonRect.bottom}px`,
          left: `${buttonRect.left}px`,
        };
      }
    } else {
      const buttonRect = mainDropdownButtonRef.current?.getBoundingClientRect();
      if (buttonRect) {
        return {
          position: 'absolute',
          top: '100%',
          left: '0',
        };
      }
    }

    return {};
  };

  return (
    <header className={styles.headerWrapper}>
      {/* Main Header (always static) */}
      <div className={styles.headerContainer}>
        <header className={styles.header}>
          <div className={styles.headerInnerContainer}>
            <div className={styles.container}>
              <div className={styles.headerTop}>
                {/* Logo */}
                <Link href="/">
                  <Image
                    src={logo}
                    alt="logo"
                    width={190}
                    priority
                    className={styles.desktopLogo}
                  />
                  <Image
                    src={logo}
                    alt="logo"
                    width={100}
                    priority
                    className={styles.mobileLogo}
                  />
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
          </div>
        </header>

        {/* Secondary Navigation */}
        <div className={styles.headerBottom}>
          <nav className={styles.bottomNav}>
            <div className={styles.headerInnerContainer}>
              {renderNavLinks(styles.bottomNavLink, styles.bottomNavList)}
            </div>
          </nav>
        </div>
      </div>

      {/* Separate Sticky Header that appears on scroll */}
      <div
        className={`${styles.stickyHeader} ${
          showStickyHeader ? styles.stickyHeaderVisible : ''
        }`}
      >
        <div className={styles.stickyHeaderContent}>
          {/* Logo */}
          <Link href="/">
            <Image
              src={logo}
              alt="logo"
              width={120}
              height={40}
              className={styles.desktopLogo}
              priority
            />
            <Image
              src={logo}
              alt="logo"
              width={80}
              height={30}
              className={styles.mobileLogo}
              priority
            />
          </Link>

          {/* Navigation */}
          {renderNavLinks(
            styles.stickyNavLink,
            styles.stickyNavList,
            styles.stickyNav,
            true
          )}

          {/* Sticky Header Search */}
          <div className={styles.stickySearchContainer}>
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
                <span className={styles.actionBadge}>{wishlist.length}</span>
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

            {/* Add sidebar toggle for sticky header */}
            <button
              className={`${styles.actionButton} ${styles.mobileMenu}`}
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <div
        className={`${styles.mobileSearch} ${
          isMobileSearchOpen ? styles.mobileSearchActive : ''
        }`}
      >
        <div className={styles.mobileSearchWrapper}>
          <div className={styles.mobileSearchHeader}>
            <button
              className={styles.mobileSearchClose}
              onClick={closeSearch}
              aria-label="Close search"
            >
              <Close />
            </button>
            <SearchForm inputRef={mobileSearchInputRef} />
          </div>
        </div>
        {/* Add backdrop that closes search when clicked */}
        <div
          className={styles.mobileSearchBackdrop}
          onClick={closeSearch}
        ></div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`${styles.mobileNav} ${
          isMobileNavOpen ? styles.mobileNavActive : ''
        }`}
      >
        <div className={styles.mobileNavHeader}>
          <Image
            src={logo}
            alt="logo"
            width={100}
            height={35}
            priority
            className={styles.sidebarLogo}
          />
          <button
            className={styles.actionButton}
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close menu"
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

      {/* Dropdown Menu (for Shop) */}
      <div
        id="shop-dropdown"
        className={styles.dropdownContent}
        aria-hidden={!isDropdownOpen}
        role="menu"
        onKeyDown={handleDropdownKeyDown}
        ref={dropdownRef}
        style={{
          ...getDropdownPosition(),
          display: isDropdownOpen ? 'block' : 'none',
        }}
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
                {/* <span className={styles.productCount}>
                  ({category.products.length})
                </span> */}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Cart Mini Sidebar */}
      <CartMiniSidebar />

      {/* Add this close backdrop to the existing code with the other backdrop */}
      {(isMobileNavOpen || isMobileSearchOpen) && (
        <div
          className={styles.backdrop}
          onClick={() => {
            setIsMobileNavOpen(false);
            setIsMobileSearchOpen(false);
          }}
        />
      )}
    </header>
  );
}
