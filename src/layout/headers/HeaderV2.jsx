'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import useSticky from '@/hooks/use-sticky';
import useCartInfo from '@/hooks/use-cart-info';
import { openCartMini } from '@/redux/features/cartSlice';
import CartMiniSidebar from '@/components/common/cart-mini-sidebar';
import OffCanvas from '@/components/common/off-canvas';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
import logo from '@assets/img/logo/logo.webp';
import { CartTwo, Compare, Menu, Search, User, Wishlist } from '@/svg';
import styles from './HeaderV2.module.css';
import { Router } from 'next/router';

const HeaderV2 = () => {
  const { wishlist } = useSelector(state => state.wishlist);
  const [isOffCanvasOpen, setIsCanvasOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { quantity } = useCartInfo();
  const { sticky } = useSticky();
  const dispatch = useDispatch();
  const searchRef = useRef(null);
  const [activeMobileCategory, setActiveMobileCategory] = useState(null);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } =
    useGetShowCategoryQuery();

  // Handle category route
  const handleCategoryRoute = (title, route) => {
    if (route === 'parent') {
      Router.push(
        `/shop?category=${title
          .toLowerCase()
          .replace('&', '')
          .split(' ')
          .join('-')}`
      );
    } else {
      router.push(
        `/shop?subCategory=${title
          .toLowerCase()
          .replace('&', '')
          .split(' ')
          .join('-')}`
      );
    }
  };

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, []);

  // Handle search submit
  const handleSearchSubmit = e => {
    e.preventDefault();
    // Implement your search logic here
    console.log('Search query:', searchQuery);
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

  return (
    <>
      <header
        className={`${styles.header} ${sticky ? styles.headerSticky : ''}`}
      >
        <div className={styles.container}>
          <div className={styles.headerTop}>
            {/* Logo */}
            <Link href="/" className={styles.logo}>
              <Image src={logo} alt="logo" width={120} height={40} priority />
            </Link>

            {/* Main Navigation */}
            <nav>
              <ul className={styles.navigation}>
                <li>
                  <Link
                    href="/"
                    className={`${styles.navLink} ${styles.active}`}
                  >
                    HOME
                  </Link>
                </li>
                <li className={styles.shopDropdown}>
                  <Link href="/shop" className={styles.navLink}>
                    SHOP
                    <span className={styles.dropdownIcon}>▼</span>
                  </Link>
                  <div className={styles.dropdownContent}>
                    <ul className={styles.categoryList}>
                      {filteredCategories.map(category => (
                        <li key={category._id} className={styles.categoryItem}>
                          <div
                            className={styles.categoryLink}
                            onClick={() =>
                              handleCategoryRoute(category.parent, 'parent')
                            }
                          >
                            <div>
                              <h3 className={styles.categoryTitle}>
                                {category.parent}
                              </h3>
                              <span className={styles.categoryCount}>
                                {category.products.length} Products
                              </span>
                            </div>
                            {category.children &&
                              category.children.length > 0 && (
                                <div className={styles.subCategories}>
                                  <ul className={styles.subCategoryList}>
                                    {category.children.map((child, index) => (
                                      <li key={index}>
                                        <span
                                          className={styles.subCategoryLink}
                                          onClick={e => {
                                            e.stopPropagation();
                                            handleCategoryRoute(
                                              child,
                                              'children'
                                            );
                                          }}
                                        >
                                          {child}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
                <li>
                  <Link href="/docs" className={styles.navLink}>
                    DOCS
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Search Form */}
            <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit" className={styles.searchButton}>
                <Search />
              </button>
            </form>

            {/* Action Buttons */}
            <div className={styles.actions}>
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

      {/* Mobile Navigation */}
      <div
        className={`${styles.mobileNav} ${
          isMobileNavOpen ? styles.mobileNavActive : ''
        }`}
      >
        <div className={styles.mobileNavHeader}>
          <Image src={logo} alt="logo" width={100} height={32} priority />
          <button
            className={styles.actionButton}
            onClick={() => setIsMobileNavOpen(false)}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="currentColor"
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>
        <div className={styles.mobileNavContent}>
          <ul className={styles.mobileNavigation}>
            <li>
              <Link href="/" className={styles.navLink}>
                HOME
              </Link>
            </li>
            <li>
              <Link href="/shop" className={styles.navLink}>
                SHOP
              </Link>
              {filteredCategories.map(category => (
                <div key={category._id} className={styles.mobileCategory}>
                  <div
                    className={styles.mobileCategoryHeader}
                    onClick={() => toggleMobileCategory(category._id)}
                  >
                    <div className={styles.mobileCategoryTitle}>
                      {category.parent}
                    </div>
                    <svg
                      className={`${styles.mobileDropdownIcon} ${
                        activeMobileCategory === category._id
                          ? styles.active
                          : ''
                      }`}
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                    >
                      <path fill="currentColor" d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </div>
                  {category.children && category.children.length > 0 && (
                    <div
                      className={`${styles.mobileSubCategories} ${
                        activeMobileCategory === category._id
                          ? styles.active
                          : ''
                      }`}
                    >
                      <ul className={styles.mobileSubCategoryList}>
                        {category.children.map((child, index) => (
                          <li
                            key={index}
                            className={styles.mobileSubCategoryItem}
                            onClick={() =>
                              handleCategoryRoute(child, 'children')
                            }
                          >
                            {child}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </li>
            <li>
              <Link href="/docs" className={styles.navLink}>
                DOCS
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileNavOpen && (
        <div
          className={`${styles.mobileNavOverlay} ${
            isMobileNavOpen ? styles.mobileNavOverlayActive : ''
          }`}
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Cart Mini Sidebar */}
      <CartMiniSidebar />

      {/* Off Canvas */}
      <OffCanvas
        isOffCanvasOpen={isOffCanvasOpen}
        setIsCanvasOpen={setIsCanvasOpen}
        categoryType="electronics"
      />
    </>
  );
};

export default HeaderV2;
