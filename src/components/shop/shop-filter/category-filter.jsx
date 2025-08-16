'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
// internal
import ErrorMsg from '@/components/common/error-msg';
import ShopCategoryLoader from '@/components/loader/shop/shop-category-loader';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
import { handleFilterSidebarClose } from '@/redux/features/shop-filter-slice';

const CategoryFilter = ({ setCurrPage, shop_right = false }) => {
  const { data: categories, isLoading, isError } = useGetShowCategoryQuery();
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  const currentSubcategory = searchParams.get('subcategory');

  // handle category route
  const handleCategoryRoute = title => {
    setCurrPage(1);

    // Create new URLSearchParams to preserve existing query parameters
    const newSearchParams = new URLSearchParams(searchParams);

    // Update category parameter
    const categorySlug = title
      .toLowerCase()
      .replace(/&/g, 'and') // Replace & with 'and' for better URL readability
      .split(' ')
      .join('-');

    newSearchParams.set('category', categorySlug);

    // Remove subcategory when changing main category
    if (currentSubcategory) {
      newSearchParams.delete('subcategory');
    }

    // Reset to page 1
    newSearchParams.set('page', '1');

    // Navigate to the new URL
    router.push(`/shop?${newSearchParams.toString()}`);
    dispatch(handleFilterSidebarClose());
  };

  // decide what to render
  let content = null;

  if (isLoading) {
    content = <ShopCategoryLoader loading={isLoading} />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && categories?.result?.length === 0) {
    content = <ErrorMsg msg="No Category found!" />;
  }
  if (!isLoading && !isError && categories?.result?.length > 0) {
    const category_items = categories.result;
    content = category_items.map(item => {
      const itemSlug = item.parent
        .toLowerCase()
        .replace(/&/g, 'and')
        .split(' ')
        .join('-');

      const isActive = currentCategory === itemSlug;

      return (
        <li key={item._id}>
          <a
            onClick={() => handleCategoryRoute(item.parent)}
            style={{ cursor: 'pointer' }}
            className={isActive ? 'active' : ''}
          >
            {item.parent} <span>{item.products?.length || 0}</span>
          </a>
        </li>
      );
    });
  }
  return (
    <>
      <div className="tp-shop-widget mb-50">
        <h3 className="tp-shop-widget-title">Categories</h3>
        <div className="tp-shop-widget-content">
          <div className="tp-shop-widget-categories">
            <ul>{content}</ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryFilter;
