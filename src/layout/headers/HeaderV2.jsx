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
import logo from '@assets/img/logo/logo.webp';
import { CartTwo, Close, Compare, Menu, Search, User, Wishlist } from '@/svg';
import styles from './HeaderV2.module.css';
import { useRouter } from 'next/navigation';
import SearchForm from '@/components/V2/common/SearchForm';

const CategoryCard = ({ category, onCategoryClick }) => {
  const router = useRouter();

  const handleParentClick = e => {
    e.stopPropagation();
    router.push(
      `/shop?category=${category.parent
        .toLowerCase()
        .replace('&', '')
        .split(' ')
        .join('-')}`
    );
    onCategoryClick();
  };

  const handleSubCategoryClick = (e, child) => {
    e.stopPropagation();
    router.push(
      `/shop?category=${category.parent
        .toLowerCase()
        .replace('&', '')
        .split(' ')
        .join('-')}&subCategory=${child
        .toLowerCase()
        .replace('&', '')
        .split(' ')
        .join('-')}`
    );
    onCategoryClick();
  };

  return (
    <div className={styles.categoryLink} role="menuitem" tabIndex="0">
      <button onClick={handleParentClick} className={styles.categoryHeader}>
        <span className={styles.categoryTitle}>{category.parent}</span>
        <span className={styles.categoryCount}>
          {category.products.length} Products
        </span>
      </button>
      {category.children && category.children.length > 0 && (
        <div className={styles.subCategories}>
          <ul
            className={styles.subCategoryList}
            role="menu"
            aria-label={`${category.parent} subcategories`}
          >
            {category.children.map((child, index) => (
              <li key={index} role="none">
                <button
                  className={styles.subCategoryLink}
                  onClick={e => handleSubCategoryClick(e, child)}
                  role="menuitem"
                >
                  {child}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const HeaderV2 = () => {
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

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } =
    useGetShowCategoryQuery();

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

  // Close dropdown when navigating
  const handleCategoryClick = () => {
    setIsDropdownOpen(false);
  };

  // Handle category route
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

  return (
    <>
      <header
        className={`${styles.header} ${sticky ? styles.headerSticky : ''}`}
      >
        <div className={styles.container}>
          <div className={styles.headerTop}>
            {/* Logo */}
            <Link href="/">
              <Image src={logo} alt="logo" width={120} priority />
            </Link>

            {/* Main Navigation */}
            <nav>
              <ul className={styles.navigation}>
                <li>
                  <Link href="/" className={styles.navLink}>
                    HOME
                  </Link>
                </li>
                <li className={styles.shopDropdown} ref={dropdownRef}>
                  <button
                    ref={dropdownButtonRef}
                    className={styles.dropdownButton}
                    onClick={handleDropdownToggle}
                    aria-expanded={isDropdownOpen}
                    aria-controls="shop-dropdown"
                    aria-haspopup="true"
                  >
                    Shop
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
                  >
                    <ul className={styles.categoryList} role="none">
                      {filteredCategories.map(category => (
                        <li
                          key={category._id}
                          className={styles.categoryItem}
                          role="none"
                          onClick={() => {
                            handleCategoryRoute(category.parent);
                            handleCategoryClick();
                          }}
                        >
                          <CategoryCard
                            category={category}
                            onCategoryClick={handleCategoryClick}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
                <li>
                  <Link href="/shop" className={styles.navLink}>
                    PRODUCTS
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Desktop Search */}
            <div className={styles.searchContainer}>
              <SearchForm />
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button
                className={styles.searchButton}
                onClick={() => setIsMobileSearchOpen(true)}
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
          <SearchForm />
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
    </>
  );
};

export default HeaderV2;
