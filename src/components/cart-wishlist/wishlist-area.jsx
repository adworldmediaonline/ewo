'use client';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import WishlistItem from './wishlist-item';

export default function WishlistArea() {
  const { wishlist } = useSelector(state => state.wishlist);

  return (
    <section className="">
      <div className="">
        {wishlist.length === 0 ? (
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
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h2 className="">Your Wishlist is Empty</h2>
              <p className="">
                Save your favorite items to your wishlist and come back to them
                later.
              </p>
              <Link href="/shop" className="">
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="">
            {/* Header */}
            <div className="">
              <div className="">
                <h1 className="">My Wishlist</h1>
                <p className="">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}{' '}
                  saved
                </p>
              </div>
            </div>

            <div className="">
              {/* Wishlist Items */}
              <div className="">
                <div className="">
                  {wishlist.map((item, i) => (
                    <WishlistItem key={i} product={item} />
                  ))}
                </div>
              </div>

              {/* Wishlist Actions */}
              <div className="">
                <div className="">
                  <div className="">
                    <h3 className="">Quick Actions</h3>
                  </div>
                  <div className="">
                    <Link href="/cart" className="">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      View Cart
                    </Link>
                    <Link href="/shop" className="">
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
