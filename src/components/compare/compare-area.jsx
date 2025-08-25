'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { Rating } from 'react-simple-star-rating';
// internal
import { add_cart_product } from '@/redux/features/cartSlice';
import { remove_compare_product } from '@/redux/features/compareSlice';

export default function CompareArea() {
  const { compareItems } = useSelector(state => state.compare);
  const dispatch = useDispatch();

  // handle add product
  const handleAddProduct = prd => {
    dispatch(add_cart_product(prd));
  };

  // handle remove product
  const handleRemoveComparePrd = prd => {
    dispatch(remove_compare_product(prd));
  };

  return (
    <section className="">
      <div className="">
        {compareItems.length === 0 ? (
          <div className="">
            <div className="">
              <div className="">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 6H3"></path>
                  <path d="M10 12H3"></path>
                  <path d="M10 18H3"></path>
                  <circle cx="17" cy="12" r="3"></circle>
                  <path d="M18.5 10.5L16.5 13.5L15 12"></path>
                </svg>
              </div>
              <h2 className="">No Products to Compare</h2>
              <p className="">
                Add products to compare their features, prices, and
                specifications side by side.
              </p>
              <Link href="/shop" className="">
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="">
            {/* Header */}
            <div className="">
              <div className="">
                <h1 className="">Product Comparison</h1>
                <p className="">
                  Comparing {compareItems.length}{' '}
                  {compareItems.length === 1 ? 'product' : 'products'}
                </p>
              </div>
            </div>

            {/* Compare Grid */}
            <div className="">
              {compareItems.map((item, index) => (
                <div key={item._id} className="">
                  {/* Remove Button */}
                  <button
                    onClick={() =>
                      handleRemoveComparePrd({
                        title: item.title,
                        id: item._id,
                      })
                    }
                    className=""
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>

                  {/* Product Image */}
                  <div className="">
                    <Link href={`/product/${item.slug}`}>
                      <Image
                        src={item.img}
                        alt={item.title}
                        width={200}
                        height={200}
                        className=""
                      />
                    </Link>
                  </div>

                  {/* Product Info */}
                  <div className="">
                    <h3 className="">
                      <Link href={`/product/${item.slug}`}>{item.title}</Link>
                    </h3>

                    <div className="">${item.price.toFixed(2)}</div>

                    {/* Rating */}
                    <div className="">
                      <Rating
                        allowFraction
                        size={16}
                        initialValue={
                          item.reviews.length > 0
                            ? item.reviews.reduce(
                                (acc, review) => acc + review.rating,
                                0
                              ) / item.reviews.length
                            : 0
                        }
                        readonly={true}
                      />
                      <span className="">({item.reviews.length} reviews)</span>
                    </div>

                    {/* Description */}
                    <div className="">
                      <h4>Description</h4>
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            item.description ||
                            'High-quality product with excellent features and performance. Perfect for your needs with reliable functionality and modern design.',
                        }}
                      />
                    </div>

                    {/* Actions */}
                    <div className="">
                      <button
                        onClick={() => handleAddProduct(item)}
                        className=""
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Add to Cart
                      </button>
                      <Link href={`/product/${item.slug}`} className="">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="">
              <Link href="/shop" className="">
                Add More Products
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
