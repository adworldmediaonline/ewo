'use client';

import Image from 'next/image';
import Link from 'next/link';

import { titleCaseFirstLetterOfEveryWord } from '@/lib/titleCaseFirstLetterOfEveryWord';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
import EmptyState from '../common/EmptyState';
import CategorySkeleton from '../loaders/CategorySkeleton';

export default function CategoryItems() {
  const { data, isLoading, isError, refetch } = useGetShowCategoryQuery();

  if (isLoading) {
    return <CategorySkeleton />;
  }

  if (isError) {
    return (
      <EmptyState
        title="Failed to Load Categories"
        message="We encountered an error while loading categories. Please try again later."
        icon="error"
        action={() => refetch()}
        actionText="Try Again"
      />
    );
  }

  if (!data?.result?.length) {
    return (
      <EmptyState
        title="No Categories Found"
        message="There are no categories available at this time."
        icon="category"
        actionLink="/"
        actionText="Back to Home"
      />
    );
  }

  // Filter out categories with no products or hidden status
  const filteredCategories = data.result.filter(
    category => category.products?.length > 0 && category.status === 'Show'
  );

  // If after filtering there are no categories, show empty state
  if (!filteredCategories.length) {
    return (
      <EmptyState
        title="No Active Categories"
        message="There are no categories with products available at this time."
        icon="category"
        actionLink="/"
        actionText="Back to Home"
      />
    );
  }

  return (
    <div className="">
      {/* <div className="">
        <h2 className="">
          <span className="">Explore</span> Categories
        </h2>
        <p className="">
          Find high-quality auto parts for your vehicle from our extensive
          catalog
        </p>
      </div> */}

      <div className="">
        {filteredCategories.map((category, index) => (
          <Link
            href={`/category?id=${category._id}`}
            key={category._id}
            className=" "
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="">
              <Image
                src={category.img}
                alt={category.parent}
                width={240}
                height={240}
                className=""
                priority={filteredCategories.indexOf(category) < 6}
              />
              <div className="">
                <span className="">
                  View Parts
                  <svg
                    className=""
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <div className="">
              <h3 className="">
                {titleCaseFirstLetterOfEveryWord(category?.parent)}
              </h3>
              {/* <div className=""> */}
              {/* <span className="">
                  {category.products.length}{' '}
                  {category.products.length === 1 ? 'part' : 'parts'}
                </span>
                <div className=""></div> */}
              {/* <span className="">Shop Now</span> */}
              {/* </div> */}
            </div>
            <div className=""></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
