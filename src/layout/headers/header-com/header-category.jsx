'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// internal
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
import ErrorMsg from '@/components/common/error-msg';
import Loader from '@/components/loader/loader';

const HeaderCategory = ({ isCategoryActive }) => {
  const { data: categories, isError, isLoading } = useGetShowCategoryQuery();
  const router = useRouter();

  // handle category route
  const handleCategoryRoute = (title, route) => {
    if (route === 'parent') {
      router.push(
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
  // decide what to render
  let content = null;

  if (isLoading) {
    content = (
      <div className="py-5">
        <Loader loading={isLoading} />
      </div>
    );
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && categories?.result?.length === 0) {
    content = <ErrorMsg msg="No Category found!" />;
  }
  if (!isLoading && !isError && categories?.result?.length > 0) {
    // Filter categories to only show ones with products and status 'Show'
    const category_items = categories.result.filter(
      cat => cat.products?.length > 0 && cat.status === 'Show'
    );

    content = category_items.map(item => (
      <li className="has-dropdown" key={item._id}>
        <a
          className="cursor-pointer"
          onClick={() => handleCategoryRoute(item.parent, 'parent')}
        >
          {item.img && (
            <span>
              <Image
                src={item.img}
                alt={`${item.parent} category`}
                width={50}
                height={50}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
            </span>
          )}
          {item.parent}
        </a>

        {item.children && item.children.length > 0 && (
          <ul className="tp-submenu">
            {item.children.map((child, i) => (
              <li
                key={i}
                onClick={() => handleCategoryRoute(child, 'children')}
              >
                <a className="cursor-pointer">{child}</a>
              </li>
            ))}
          </ul>
        )}
      </li>
    ));
  }
  return <ul className={isCategoryActive ? 'active' : ''}>{content}</ul>;
};

export default HeaderCategory;
