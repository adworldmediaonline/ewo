// Removed CSS module import; Tailwind-only styling
import Link from 'next/link';

function ProductCategoryDisplay({ title, categories }) {
  const columnClass = '';

  return (
    <div className="">
      <h1 className="">{title}</h1>
      <div className=""></div>

      <div className="">
        {categories.map((category, index) => (
          <div key={index} className="">
            <h2 className="">{category.title}</h2>
            <Link href={category.link || '/shop'} className="">
              Browse Products
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className=""
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductCategoryDisplay;
