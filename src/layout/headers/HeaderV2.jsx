'use client';
import CartMiniSidebar from '@/components/common/cart-mini-sidebar';
import useCartInfo from '@/hooks/use-cart-info';
import useSticky from '@/hooks/use-sticky';
import { openCartMini } from '@/redux/features/cartSlice';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import logo from '@assets/img/logo/logo.webp';
import SearchForm from '@/components/V2/common/SearchForm';
import { CartTwo, Close, Compare, Menu, Search, User, Wishlist } from '@/svg';
import logo from '@assets/img/logo/logo.png';
import { useRouter } from 'next/navigation';
const styles = new Proxy({}, { get: () => '' });

export default function HeaderV2() {
  const { wishlist } = useSelector(state => state.wishlist);
  const { user } = useSelector(state => state.auth);
  const pathname = usePathname();
  const isCheckoutPage = pathname === '/checkout';
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

  // Add debounce ref to prevent double clicks
  const toggleDebounceRef = useRef(false);

  // Modern scroll handling - show sticky header when scrolling up
  useEffect(() => {
    // Disable sticky header on checkout page
    if (isCheckoutPage) {
      setShowStickyHeader(false);
      return;
    }

    let lastTime = 0;
    const throttleDelay = 100; // 100ms throttle for better performance

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastTime < throttleDelay) return;
      lastTime = now;

      const currentScrollPos = window.scrollY;
      const scrollDelta = currentScrollPos - prevScrollPos.current;

      // Use different thresholds for different screen sizes
      const isMobile = window.innerWidth <= 768;
      const threshold = isMobile ? 100 : 200;
      const hideThreshold = 50; // Minimum scroll distance to trigger hide/show

      // At the top of the page - always hide sticky header
      if (currentScrollPos <= threshold) {
        setShowStickyHeader(false);
      }
      // Past threshold - show/hide based on scroll direction
      else if (currentScrollPos > threshold) {
        // Only change state if there's significant scroll movement
        if (Math.abs(scrollDelta) > hideThreshold) {
          if (scrollDelta < 0) {
            // Scrolling up - show sticky header
            setShowStickyHeader(true);
          } else {
            // Scrolling down - hide sticky header
            setShowStickyHeader(false);
          }
        }
      }

      prevScrollPos.current = currentScrollPos;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCheckoutPage]);

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
            className="${linkClassName} "
            onMouseEnter={() =>
              handleDropdownHover(isSticky ? 'sticky' : 'main')
            }
            onClick={() => handleDropdownToggle(isSticky ? 'sticky' : 'main')}
            aria-expanded={isDropdownOpen}
            aria-controls="shop-dropdown"
            aria-haspopup="true"
          >
            SHOP
            <span className="">▼</span>
            <span className="">
              {isDropdownOpen ? 'Close menu' : 'Open menu'}
            </span>
          </button>
        </li>
        <li>
          <Link href="/shop" className={linkClassName}>
            PRODUCTS
          </Link>
        </li>
        <li>
          <Link href="/contact" className={linkClassName}>
            CONTACT
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
    // Prevent double clicks with debounce
    if (toggleDebounceRef.current) return;

    toggleDebounceRef.current = true;
    setTimeout(() => {
      toggleDebounceRef.current = false;
    }, 300); // 300ms debounce

    // Use functional update to ensure we get the latest state
    setIsMobileNavOpen(prevState => {
      const newState = !prevState;

      // Reset states when closing
      if (!newState) {
        setIsMobileShopOpen(false);
        setActiveMobileCategory(null);
      }

      return newState;
    });
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
  }, []); // Remove dependencies to prevent re-running

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

  // Helper function to get user initials
  const getUserInitials = name => {
    if (!name) return 'U';

    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  // User Profile Component
  const renderUserProfile = () => {
    if (user) {
      return (
        <Link href="/profile" className="">
          {user.imageURL ? (
            <Image
              src={user.imageURL}
              alt={user.name}
              width={32}
              height={32}
              className=""
            />
          ) : (
            <div className="">
              {getUserInitials(user.name)}
            </div>
          )}
        </Link>
      );
    }

    return (
      <Link href="/profile" className="">
        <User />
      </Link>
    );
  };

  // Phone number component
  const renderPhoneNumber = (className = '') => (
    <a
      href="tel:1-866-396-7623"
      className=" ${className}"
      aria-label="Call us at 1-866-EWO-ROAD"
    >
      <div className="">
        <span className="">1-866-EWO-ROAD</span>
        <span className="">(396-7623)</span>
      </div>
    </a>
  );

  // Checkout header variant - single header with all functionality
  const renderCheckoutHeader = () => (
    <div className="">
      <header className="">
        <div className="">
          <div className="">
            <div className="">
              {/* Logo - 97px height as requested */}
              <Link href="/" className="">
                <Image
                  src={logo}
                  alt="logo"
                  width={180}
                  height={60}
                  priority
                  className=""
                  style={{
                    width: 'auto',
                    height: '97px',
                    maxWidth: '180px',
                  }}
                />
              </Link>

              {/* Navigation */}
              <nav className="">
                <ul className="">
                  <li>
                    <Link href="/" className="">
                      HOME
                    </Link>
                  </li>
                  <li>
                    <button
                      ref={mainDropdownButtonRef}
                      className=" "
                      onMouseEnter={() => handleDropdownHover('main')}
                      onClick={() => handleDropdownToggle('main')}
                      aria-expanded={isDropdownOpen}
                      aria-controls="shop-dropdown"
                      aria-haspopup="true"
                    >
                      SHOP
                      <span className="">▼</span>
                    </button>
                  </li>
                  <li>
                    <Link href="/shop" className="">
                      PRODUCTS
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="">
                      CONTACT
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Search */}
              <div className="">
                <SearchForm />
              </div>

              {/* Phone Number */}
              <div className="">
                {renderPhoneNumber(styles.checkoutPhoneNumber)}
              </div>

              {/* Action Buttons */}
              <div className="">
                <button
                  className=""
                  onClick={handleMobileSearchOpen}
                >
                  <Search />
                </button>

                <Link href="/compare" className="">
                  <Compare />
                </Link>

                <Link href="/wishlist" className="">
                  <Wishlist />
                  {wishlist.length > 0 && (
                    <span className="">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                <button
                  className=""
                  onClick={() => dispatch(openCartMini())}
                >
                  <CartTwo />
                  {quantity > 0 && (
                    <span className="">{quantity}</span>
                  )}
                </button>

                {renderUserProfile()}

                <button
                  className=""
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
    </div>
  );

  // Modern Professional Banner Component
  const renderScrollingBanner = () => (
    <div className="">
      <div className="">
        <span className="">
          Join EWO Army and stay connected for deals and discounts
        </span>
      </div>
    </div>
  );

  return (
    <>
      {isCheckoutPage ? (
        <>
          {renderScrollingBanner()}
          {renderCheckoutHeader()}

          {/* Mobile Navigation (shared) */}
          <div
            className={` ${
              isMobileNavOpen ? styles.mobileNavActive : ''
            }`}
            ref={mobileNavRef}
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="">
              <Image
                src={logo}
                alt="logo"
                width={90}
                height={30}
                priority
                className=""
              />
              <button
                className=""
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
            <div className="">
              {/* Mobile Phone Number */}
              <div className="">
                {renderPhoneNumber(styles.mobilePhoneNumber)}
              </div>

              <ul className="">
                <li>
                  <Link
                    href="/"
                    className=""
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    HOME
                  </Link>
                </li>
                <li>
                  <div className="">
                    <button
                      className=""
                      onClick={toggleMobileShop}
                      aria-expanded={isMobileShopOpen}
                    >
                      <span className="">SHOP</span>
                      <svg
                        style={{ color: 'black' }}
                        className={` ${
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
                      className={` ${
                        isMobileShopOpen ? styles.active : ''
                      }`}
                    >
                      {/* All Products Link */}
                      <button
                        className=""
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
                          className=""
                        >
                          {category.children && category.children.length > 0 ? (
                            <>
                              <button
                                className=""
                                onClick={() =>
                                  toggleMobileCategory(category._id)
                                }
                                aria-expanded={
                                  activeMobileCategory === category._id
                                }
                              >
                                <span className="">
                                  {category.parent}
                                </span>
                                <svg
                                  className={` ${
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
                                className={` ${
                                  activeMobileCategory === category._id
                                    ? styles.active
                                    : ''
                                }`}
                              >
                                {category.children?.map((child, index) => (
                                  <button
                                    key={index}
                                    className=""
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
                              className=""
                              onClick={() =>
                                handleCategoryRoute(category.parent)
                              }
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
                    className=""
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    ABOUT
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop"
                    className=""
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    PRODUCTS
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className=""
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    CONTACT
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile Navigation Backdrop */}
          <div
            className={` ${
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
            className=""
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
            <ul className="" role="none">
              {filteredCategories.map(category => (
                <li
                  key={category._id}
                  className=""
                  role="none"
                >
                  <button
                    className=""
                    onClick={() => handleCategoryNavigation(category)}
                    role="menuitem"
                  >
                    {category.parent}
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
              className=""
              onClick={closeSearch}
              aria-hidden="true"
            />
          )}

          {/* Mobile Search Overlay */}
          <div
            className={` ${
              isMobileSearchOpen ? styles.mobileSearchActive : ''
            }`}
            onClick={closeSearch}
          >
            <div className="">
              <div
                className=""
                onClick={e => e.stopPropagation()}
              >
                <button
                  className=""
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
      ) : (
        <>
          {renderScrollingBanner()}
          <header className="">
            {/* Main Header (always static) */}
            <div className="">
              <header className="">
                <div className="">
                  <div className="">
                    <div className="">
                      {/* Logo */}
                      <Link href="/">
                        <Image
                          src={logo}
                          alt="logo"
                          width={140}
                          priority
                          className=""
                        />
                        <Image
                          src={logo}
                          alt="logo"
                          width={80}
                          priority
                          className=""
                        />
                      </Link>

                      {/* Action Buttons */}
                      <div className="">
                        <button
                          className=""
                          onClick={handleMobileSearchOpen}
                        >
                          <Search />
                        </button>

                        <Link href="/compare" className="">
                          <Compare />
                        </Link>

                        <Link href="/wishlist" className="">
                          <Wishlist />
                          {wishlist.length > 0 && (
                            <span className="">
                              {wishlist.length}
                            </span>
                          )}
                        </Link>

                        <button
                          className=""
                          onClick={() => dispatch(openCartMini())}
                        >
                          <CartTwo />
                          {quantity > 0 && (
                            <span className="">
                              {quantity}
                            </span>
                          )}
                        </button>

                        {renderUserProfile()}

                        <div className="">
                          {renderPhoneNumber(styles.actionPhoneNumber)}
                        </div>

                        <button
                          className=""
                          onClick={handleMobileNavToggle}
                          aria-label="Open menu"
                          aria-expanded={isMobileNavOpen}
                          ref={mobileMenuButtonRef}
                          disabled={showStickyHeader}
                          style={{
                            pointerEvents: showStickyHeader ? 'none' : 'auto',
                            opacity: showStickyHeader ? 0.5 : 1,
                          }}
                        >
                          <Menu />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              {/* Secondary Navigation */}
              <div className="">
                <nav className="">
                  <div className="">
                    <div className="">
                      {renderNavLinks(
                        styles.bottomNavLink,
                        styles.bottomNavList
                      )}
                      {/* Desktop Search */}
                      <div className="">
                        <SearchForm />
                      </div>
                    </div>
                  </div>
                </nav>
              </div>
            </div>

            {/* Separate Sticky Header that appears on scroll */}
            <div
              className={` ${
                showStickyHeader ? styles.stickyHeaderVisible : ''
              }`}
            >
              <div className="">
                {/* Logo */}
                <Link href="/">
                  <Image
                    src={logo}
                    alt="logo"
                    width={90}
                    height={30}
                    className=""
                    priority
                  />
                  <Image
                    src={logo}
                    alt="logo"
                    width={60}
                    height={20}
                    className=""
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
                <div className="">
                  <SearchForm />
                </div>

                {/* Phone Number */}
                <div className="">
                  {renderPhoneNumber(styles.stickyPhoneNumber)}
                </div>

                {/* Action Buttons */}
                <div className="">
                  <button
                    className=""
                    onClick={handleMobileSearchOpen}
                  >
                    <Search />
                  </button>

                  <Link href="/compare" className="">
                    <Compare />
                  </Link>

                  <Link href="/wishlist" className="">
                    <Wishlist />
                    {wishlist.length > 0 && (
                      <span className="">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>

                  <button
                    className=""
                    onClick={() => dispatch(openCartMini())}
                  >
                    <CartTwo />
                    {quantity > 0 && (
                      <span className="">{quantity}</span>
                    )}
                  </button>

                  {renderUserProfile()}

                  {/* Add sidebar toggle for sticky header */}
                  <button
                    className=""
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
              className={` ${
                isMobileNavOpen ? styles.mobileNavActive : ''
              }`}
              ref={mobileNavRef}
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div className="">
                <Image
                  src={logo}
                  alt="logo"
                  width={90}
                  height={30}
                  priority
                  className=""
                />
                <button
                  className=""
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
              <div className="">
                {/* Mobile Phone Number */}
                <div className="">
                  {renderPhoneNumber(styles.mobilePhoneNumber)}
                </div>

                <ul className="">
                  <li>
                    <Link
                      href="/"
                      className=""
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      HOME
                    </Link>
                  </li>
                  <li>
                    <div className="">
                      <button
                        className=""
                        onClick={toggleMobileShop}
                        aria-expanded={isMobileShopOpen}
                      >
                        <span className="">SHOP</span>
                        {/*  */}
                        <svg
                          style={{ color: 'black' }}
                          className={` ${
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
                        className={` ${
                          isMobileShopOpen ? styles.active : ''
                        }`}
                      >
                        {/* All Products Link */}
                        <button
                          className=""
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
                            className=""
                          >
                            {category.children &&
                            category.children.length > 0 ? (
                              <>
                                <button
                                  className=""
                                  onClick={() =>
                                    toggleMobileCategory(category._id)
                                  }
                                  aria-expanded={
                                    activeMobileCategory === category._id
                                  }
                                >
                                  <span
                                    className=""
                                  >
                                    {category.parent}
                                  </span>
                                  <svg
                                    className={`${
                                      styles.mobileSubDropdownIcon
                                    } ${
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
                                  className={`${
                                    styles.mobileSubSubCategories
                                  } ${
                                    activeMobileCategory === category._id
                                      ? styles.active
                                      : ''
                                  }`}
                                >
                                  {category.children?.map((child, index) => (
                                    <button
                                      key={index}
                                      className=""
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
                                className=""
                                onClick={() =>
                                  handleCategoryRoute(category.parent)
                                }
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
                      className=""
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      ABOUT
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/shop"
                      className=""
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      PRODUCTS
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className=""
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      CONTACT
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Mobile Navigation Backdrop */}
            <div
              className={` ${
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
              className=""
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
              <ul className="" role="none">
                {filteredCategories.map(category => (
                  <li
                    key={category._id}
                    className=""
                    role="none"
                  >
                    <button
                      className=""
                      onClick={() => handleCategoryNavigation(category)}
                      role="menuitem"
                    >
                      {category.parent}
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
                className=""
                onClick={closeSearch}
                aria-hidden="true"
              />
            )}
          </header>

          {/* Mobile Search Overlay - Outside header for highest z-index */}
          <div
            className={` ${
              isMobileSearchOpen ? styles.mobileSearchActive : ''
            }`}
            onClick={closeSearch}
          >
            <div className="">
              <div
                className=""
                onClick={e => e.stopPropagation()}
              >
                <button
                  className=""
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
      )}
    </>
  );
}
