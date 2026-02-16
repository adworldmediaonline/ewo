'use client';
import { hideCartConfirmation } from '@/redux/features/cartSlice';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Image from 'next/image';
import Link from 'next/link';

export default function CartConfirmationModal() {
  const dispatch = useDispatch();
  const modalRef = useRef(null);

  const { cart_products, showCartConfirmation, lastAddedProduct } = useSelector(
    state => state.cart
  );

  const handleClose = useCallback(() => {
    dispatch(hideCartConfirmation());
  }, [dispatch]);

  const handleViewCart = useCallback(() => {
    dispatch(hideCartConfirmation());
  }, [dispatch]);

  const totalItems = cart_products.reduce(
    (total, item) => total + item.orderQuantity,
    0
  );

  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleViewCart();
      }
    },
    [handleViewCart]
  );

  if (!showCartConfirmation) {
    return null;
  }

  return (
    <>
      <style jsx global>{`
        @keyframes slideUpCenter {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .cart-modal-container {
          position: fixed;
          bottom: 1.25rem;
          left: 50%;
          transform: translate(-50%, 20px);
          z-index: 9999;
          pointer-events: none;
          opacity: 0;
          animation: slideUpCenter 0.3s ease-out forwards;
        }
      `}</style>
      <div
        ref={modalRef}
        className="cart-modal-container"
      >
        {/* Green Bar with everything inside */}
        <div
          className="bg-[#4caf50] text-white rounded-full px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-200 min-w-[200px] max-w-[300px] h-14 flex items-center gap-3 hover:bg-[#45a049] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] pointer-events-auto relative"
        >
          <Link
            href="/checkout"
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={handleViewCart}
          >
            {/* Product Images - Inside the bar on the left */}
            {cart_products.length > 0 && (
              <div className="shrink-0 relative w-12 h-8 flex items-center justify-start">
                {cart_products.slice(-3).map((product, index) => (
                  <div
                    key={`${product._id}-${index}`}
                    className="absolute w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-sm border border-gray-200"
                    style={{
                      zIndex: cart_products.length - index,
                      transform: `translateX(${index * -8}px)`,
                      opacity: index === cart_products.slice(-3).length - 1 ? 1 : 0.6,
                    }}
                  >
                    <Image
                      src={product.img}
                      alt={product.title || 'Product'}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Text Content */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* <span className="font-semibold text-base whitespace-nowrap">
                View cart
              </span> */}
              <span className="bg-white/25 px-2 py-1 rounded-xl text-sm font-medium whitespace-nowrap">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Arrow */}
            <div className="shrink-0 flex items-center justify-center w-6 h-6 opacity-80">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="shrink-0 w-6 h-6 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity rounded-full hover:bg-white/20"
            aria-label="Close cart confirmation"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
