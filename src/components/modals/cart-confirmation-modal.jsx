import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { hideCartConfirmation } from '@/redux/features/cartSlice';
import Image from 'next/image';

export default function CartConfirmationModal() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cart_products, showCartConfirmation, lastAddedProduct } = useSelector(
    state => state.cart
  );

  // Using useCallback for optimal performance
  const handleScroll = useCallback(() => {
    dispatch(hideCartConfirmation());
  }, [dispatch]);

  useEffect(() => {
    if (!showCartConfirmation) return;

    // Next.js best practice: check if window is available (SSR safety)
    if (typeof window === 'undefined') return;

    // Add scroll event listener using Next.js best practices
    const scrollOptions = { passive: true };

    window.addEventListener('scroll', handleScroll, scrollOptions);
    document.addEventListener('scroll', handleScroll, {
      ...scrollOptions,
      capture: true,
    });

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [showCartConfirmation, handleScroll]);

  const handleClick = () => {
    dispatch(hideCartConfirmation());
    router.push('/cart');
  };

  if (!showCartConfirmation) return null;

  const totalItems = cart_products.reduce(
    (total, item) => total + item.orderQuantity,
    0
  );

  return (
    <div className="cart-confirmation-overlay">
      <div
        className="cart-confirmation-modal"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
      >
        <div className="cart-confirmation-content">
          {/* Product Images - Stacked */}
          <div className="product-images-container">
            {cart_products.length > 0 ? (
              <div className="product-images-stack">
                {cart_products.slice(-3).map((product, index) => (
                  <div
                    key={`${product._id}-${index}`}
                    className="product-image-wrapper"
                    style={{
                      zIndex: cart_products.length - index,
                      transform: `translateX(${index * -8}px)`,
                    }}
                  >
                    <Image
                      src={product.img}
                      alt={product.title || 'Product'}
                      width={32}
                      height={32}
                      className="product-image"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="product-placeholder">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17A2 2 0 0 1 15 19H9A2 2 0 0 1 7 17V13M17 13H7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="cart-text-content">
            <span className="view-cart-text">View cart</span>
            <span className="item-count">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Arrow */}
          <div className="arrow-icon">
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
        </div>
      </div>

      <style jsx>{`
        .cart-confirmation-overlay {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          animation: slideUp 0.3s ease-out;
        }

        .cart-confirmation-modal {
          background: #4caf50;
          color: white;
          border-radius: 50px;
          padding: 12px 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 200px;
          max-width: 300px;
          height: 56px;
          display: flex;
          align-items: center;
        }

        .cart-confirmation-modal:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
          background: #45a049;
        }

        .cart-confirmation-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 12px;
        }

        .product-images-container {
          flex-shrink: 0;
          position: relative;
          width: 48px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        .product-images-stack {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          height: 100%;
        }

        .product-image-wrapper {
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid #4caf50;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .product-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: white;
          opacity: 0.8;
        }

        .cart-text-content {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .view-cart-text {
          font-weight: 600;
          font-size: 16px;
          white-space: nowrap;
        }

        .item-count {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
        }

        .arrow-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          opacity: 0.8;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @media (max-width: 768px) {
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }

        @media (max-width: 768px) {
          .cart-confirmation-overlay {
            bottom: 16px;
            left: 16px;
            right: 16px;
            transform: none;
            width: calc(100% - 32px);
          }

          .cart-confirmation-modal {
            min-width: auto;
            max-width: none;
            width: 100%;
            height: 60px;
            padding: 14px 20px;
          }

          .cart-text-content {
            gap: 6px;
          }

          .view-cart-text {
            font-size: 15px;
          }

          .item-count {
            font-size: 13px;
            padding: 3px 6px;
          }

          .product-images-container {
            width: 44px;
            height: 28px;
          }

          .product-image-wrapper {
            width: 28px;
            height: 28px;
          }

          .arrow-icon {
            width: 20px;
            height: 20px;
          }
        }

        @media (max-width: 480px) {
          .cart-confirmation-overlay {
            bottom: 12px;
            left: 12px;
            right: 12px;
            width: calc(100% - 24px);
          }

          .cart-confirmation-modal {
            height: 56px;
            padding: 12px 16px;
          }

          .cart-text-content {
            gap: 4px;
          }

          .view-cart-text {
            font-size: 14px;
          }

          .item-count {
            font-size: 12px;
            padding: 2px 5px;
          }

          .product-images-container {
            width: 40px;
            height: 26px;
          }

          .product-image-wrapper {
            width: 26px;
            height: 26px;
          }

          .arrow-icon {
            width: 18px;
            height: 18px;
          }

          .arrow-icon svg {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>
    </div>
  );
}
