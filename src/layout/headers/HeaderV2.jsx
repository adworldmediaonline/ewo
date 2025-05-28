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
  const dropdownTimeoutRef = useRef(null);
  const mobileNavRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false);

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

  const handleDropdownHover = buttonType => {
    // Clear any existing timeout
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdownButton(buttonType);
    setIsDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    // Add a small delay before closing to prevent flickering
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
  };

  // Clear timeout on component unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

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

  // Toggle mobile shop section
  const toggleMobileShop = () => {
    setIsMobileShopOpen(!isMobileShopOpen);
  };

  // Create a navigation component that can be reused
  const renderNavLinks = (
    linkClassName,
    navListClassName,
    containerClassName,
    isSticky = false
  ) => (
    <div
      className={containerClassName || ''}
      onMouseLeave={handleDropdownLeave}
    >
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
            onMouseEnter={() =>
              handleDropdownHover(isSticky ? 'sticky' : 'main')
            }
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
      // For main header dropdown, use fixed positioning
      const buttonRect = mainDropdownButtonRef.current?.getBoundingClientRect();
      if (buttonRect) {
        return {
          position: 'fixed',
          top: `${buttonRect.bottom}px`,
          left: `${buttonRect.left}px`,
        };
      }
    }

    return {};
  };

  // Handle mobile navigation
  const handleMobileNavToggle = () => {
    const newState = !isMobileNavOpen;
    setIsMobileNavOpen(newState);

    // Reset states when closing
    if (!newState) {
      setIsMobileShopOpen(false);
      setActiveMobileCategory(null);
    }

    // Focus management
    if (newState) {
      // When opening, focus the close button inside the nav
      setTimeout(() => {
        const closeButton = mobileNavRef.current?.querySelector(
          'button[aria-label="Close menu"]'
        );
        closeButton?.focus();
      }, 100);
    } else {
      // When closing, focus the menu button
      mobileMenuButtonRef.current?.focus();
    }
  };

  // Handle escape key for mobile navigation
  useEffect(() => {
    const handleEscapeKey = event => {
      if (event.key === 'Escape') {
        if (isMobileNavOpen) {
          setIsMobileNavOpen(false);
        }
        if (isMobileSearchOpen) {
          setIsMobileSearchOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMobileNavOpen, isMobileSearchOpen]);

  // Body scroll lock when mobile nav is open
  useEffect(() => {
    if (isMobileNavOpen || isMobileSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileNavOpen, isMobileSearchOpen]);

  return (
    <>
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
                      width={140}
                      priority
                      className={styles.desktopLogo}
                    />
                    <Image
                      src={logo}
                      alt="logo"
                      width={80}
                      priority
                      className={styles.mobileLogo}
                    />
                  </Link>

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
                      className={styles.actionButton}
                      onClick={handleMobileNavToggle}
                      aria-label="Open menu"
                      aria-expanded={isMobileNavOpen}
                      ref={mobileMenuButtonRef}
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
                <div className={styles.bottomNavContainer}>
                  {renderNavLinks(styles.bottomNavLink, styles.bottomNavList)}
                  {/* Desktop Search */}
                  <div className={styles.bottomSearchContainer}>
                    <SearchForm />
                  </div>
                </div>
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
                width={90}
                height={30}
                className={styles.desktopLogo}
                priority
              />
              <Image
                src={logo}
                alt="logo"
                width={60}
                height={20}
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
                className={styles.actionButton}
                onClick={handleMobileNavToggle}
                aria-label="Open menu"
                aria-expanded={isMobileNavOpen}
              >
                <Menu />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`${styles.mobileNav} ${
            isMobileNavOpen ? styles.mobileNavActive : ''
          }`}
          ref={mobileNavRef}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className={styles.mobileNavHeader}>
            <Image
              src={logo}
              alt="logo"
              width={90}
              height={30}
              priority
              className={styles.sidebarLogo}
            />
            <button
              className={styles.actionButton}
              onClick={() => {
                setIsMobileNavOpen(false);
                setIsMobileShopOpen(false);
                setActiveMobileCategory(null);
              }}
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
                <div className={styles.mobileCategory}>
                  <button
                    className={styles.mobileCategoryHeader}
                    onClick={toggleMobileShop}
                    aria-expanded={isMobileShopOpen}
                  >
                    <span className={styles.mobileCategoryTitle}>SHOP</span>
                    <svg
                      style={{ color: 'black' }}
                      className={`${styles.mobileDropdownIcon} ${
                        isMobileShopOpen ? styles.active : ''
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
                      isMobileShopOpen ? styles.active : ''
                    }`}
                  >
                    {/* All Products Link */}
                    <button
                      className={styles.subCategoryLink}
                      onClick={() => {
                        router.push('/shop');
                        setIsMobileNavOpen(false);
                      }}
                    >
                      All Products
                    </button>

                    {/* Category Links */}
                    {filteredCategories.map(category => (
                      <div
                        key={category._id}
                        className={styles.mobileSubCategory}
                      >
                        {category.children && category.children.length > 0 ? (
                          <>
                            <button
                              className={styles.mobileSubCategoryHeader}
                              onClick={() => toggleMobileCategory(category._id)}
                              aria-expanded={
                                activeMobileCategory === category._id
                              }
                            >
                              <span className={styles.mobileSubCategoryTitle}>
                                {category.parent}
                              </span>
                              <svg
                                className={`${styles.mobileSubDropdownIcon} ${
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
                              className={`${styles.mobileSubSubCategories} ${
                                activeMobileCategory === category._id
                                  ? styles.active
                                  : ''
                              }`}
                            >
                              {category.children?.map((child, index) => (
                                <button
                                  key={index}
                                  className={styles.subSubCategoryLink}
                                  onClick={() =>
                                    handleChildCategoryRoute(
                                      category.parent,
                                      child
                                    )
                                  }
                                >
                                  {child}
                                </button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <button
                            className={styles.subCategoryLink}
                            onClick={() => handleCategoryRoute(category.parent)}
                          >
                            {category.parent}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </li>
              <li>
                <Link
                  href="/about"
                  className={styles.navLink}
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  ABOUT
                </Link>
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

        {/* Mobile Navigation Backdrop */}
        <div
          className={`${styles.mobileNavBackdrop} ${
            isMobileNavOpen ? styles.mobileNavBackdropActive : ''
          }`}
          onClick={() => {
            setIsMobileNavOpen(false);
            setIsMobileShopOpen(false);
            setActiveMobileCategory(null);
          }}
          aria-hidden="true"
        />

        {/* Dropdown Menu (for Shop) */}
        <div
          id="shop-dropdown"
          className={styles.dropdownContent}
          aria-hidden={!isDropdownOpen}
          role="menu"
          onKeyDown={handleDropdownKeyDown}
          onMouseEnter={() => {
            if (dropdownTimeoutRef.current) {
              clearTimeout(dropdownTimeoutRef.current);
            }
            setIsDropdownOpen(true);
          }}
          onMouseLeave={handleDropdownLeave}
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

        {/* Mobile Search Backdrop */}
        {isMobileSearchOpen && (
          <div
            className={styles.backdrop}
            onClick={closeSearch}
            aria-hidden="true"
          />
        )}
      </header>

      {/* Mobile Search Overlay - Outside header for highest z-index */}
      <div
        className={`${styles.mobileSearch} ${
          isMobileSearchOpen ? styles.mobileSearchActive : ''
        }`}
        onClick={closeSearch}
      >
        <div className={styles.mobileSearchWrapper}>
          <div
            className={styles.mobileSearchHeader}
            onClick={e => e.stopPropagation()}
          >
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
      </div>
    </>
  );
}
