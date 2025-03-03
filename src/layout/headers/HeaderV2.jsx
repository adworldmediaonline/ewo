'use client';
import React, { useState, useEffect } from 'react';
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

const HeaderV2 = () => {
  const { wishlist } = useSelector(state => state.wishlist);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState(null);
  const { quantity } = useCartInfo();
  const { sticky } = useSticky();
  const dispatch = useDispatch();
  const router = useRouter();

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } =
    useGetShowCategoryQuery();

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
                            onClick={() => handleCategoryRoute(category.parent)}
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
                                            handleChildCategoryRoute(
                                              category.parent,
                                              child
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
                  </div>
                  <div
                    className={`${styles.mobileSubCategories} ${
                      activeMobileCategory === category._id ? styles.active : ''
                    }`}
                  >
                    {category.children?.map((child, index) => (
                      <div
                        key={index}
                        className={styles.subCategoryLink}
                        onClick={() =>
                          handleChildCategoryRoute(category.parent, child)
                        }
                      >
                        {child}
                      </div>
                    ))}
                  </div>
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
