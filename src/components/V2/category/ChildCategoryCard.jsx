import Link from 'next/link';

export default function ChildCategoryCard({ category, index, parentCategory }) {
  // Format category by replacing spaces with hyphens and converting to lowercase
  const formattedCategory = category.toLowerCase().replace(/\s+/g, '-');

  // Create URL with both parent category and subcategory
  const url = parentCategory
    ? `/shop?category=${parentCategory}&subCategory=${formattedCategory}`
    : `/shop?subCategory=${formattedCategory}`;

  return (
    <div className=" " style={{ animationDelay: `${index * 0.1}s` }}>
      <div className=""></div>
      <div className=""></div>
      <div className="">
        <h3 className="">{category}</h3>
        <div className="">
          <Link href={url} className="">
            Shop Now
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className=""
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
