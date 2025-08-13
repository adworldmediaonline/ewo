'use client';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
// internal
import useCartInfo from '@/hooks/use-cart-info';
import { clearCart } from '@/redux/features/cartSlice';

import CartCheckout from './cart-checkout';
import CartItem from './cart-item';
// import RenderCartProgress from '../common/render-cart-progress';

export default function CartArea() {
  const { cart_products, firstTimeDiscount } = useSelector(state => state.cart);
  const { firstTimeDiscountAmount } = useCartInfo();
  const dispatch = useDispatch();

  return (
    <section className="">
      <div className="">
        {cart_products.length === 0 ? (
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
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <h2 className="">Your Cart is Empty</h2>
              <p className="">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Link href="/shop" className="">
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="">
            {/* First-time discount banner */}
            {firstTimeDiscount.isApplied && (
              <div className="">
                <div className="">
                  <div className="">🎉</div>
                  <div className="">
                    <h3 className="">
                      Congratulations! First-time order discount applied
                    </h3>
                    <p className="">
                      You're saving ${firstTimeDiscountAmount.toFixed(2)} (
                      {firstTimeDiscount.percentage}% off) on your first order!
                    </p>
                  </div>
                  <div className="">-{firstTimeDiscount.percentage}%</div>
                </div>
              </div>
            )}

            {/* Simple Header */}
            <div className="">
              <div className="">
                <h1 className="">Shopping Cart</h1>
                <p className="">
                  {cart_products.length}{' '}
                  {cart_products.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <button
                onClick={() => dispatch(clearCart())}
                type="button"
                className=""
              >
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
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Clear Cart
              </button>
            </div>

            <div className="">
              {/* Cart Items */}
              <div className="">
                <div className="">
                  {cart_products.map((item, i) => (
                    <CartItem key={i} product={item} />
                  ))}
                </div>
              </div>

              {/* Cart Checkout */}
              <div className="">
                <CartCheckout />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
