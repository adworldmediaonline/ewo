import React, { useRef } from 'react';
import ProductItem from '../products/fashion/product-item';
import styles from '../../app/shop/shop.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { add_cart_product } from '@/redux/features/cartSlice';

// Function to convert text to title case (first letter of each word capitalized)
// const toTitleCase = str => {
//   if (!str) return '';
//   return str
//     .toLowerCase()
//     .split(' ')
//     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(' ');
// };

const ProductItemWrapper = ({ product }) => {
  const dispatch = useDispatch();
  const { cart_products } = useSelector(state => state.cart);
  const isAddedToCart = cart_products.some(prd => prd._id === product._id);
  const cardRef = useRef(null);

  // Create a shallow copy of the product to modify the title safely
  const formattedProduct = {
    ...product,
    // title: toTitleCase(product.title),
    title: product.title,
  };

  // Custom DOM manipulation to add cart button next to price
  const addCartButtonToPrice = ref => {
    if (!ref) return;

    // Use a small timeout to ensure the DOM is ready
    setTimeout(() => {
      // Get price wrapper element
      const priceWrapper = ref.querySelector('.tp-product-price-wrapper-2');
      if (!priceWrapper) return;

      // Check if button already exists to avoid duplicates
      if (priceWrapper.querySelector('.add-to-cart-btn')) return;

      // Create the cart button
      const cartButton = document.createElement('button');
      cartButton.className = `add-to-cart-btn ${isAddedToCart ? 'active' : ''}`;
      cartButton.type = 'button';
      cartButton.disabled = product.status === 'out-of-stock';

      // Add cart SVG icon
      cartButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.3789 8.875H4.97266L5.37891 10.375H13.625C13.9092 10.375 14.1544 10.5503 14.2261 10.8232L14.2266 10.8252C14.3172 11.1667 14.1086 11.5 13.7502 11.5H5.125C4.84082 11.5 4.5957 11.3247 4.52393 11.0518L2.65723 4.25H1C0.654297 4.25 0.375 3.97071 0.375 3.625V3.125C0.375 2.77931 0.654297 2.5 1 2.5H3.375C3.6592 2.5 3.9043 2.67534 3.97607 2.94824L4.28125 4.25H15C15.3584 4.25 15.6664 4.58325 15.5766 4.9248L14.6641 8.2998C14.5918 8.5727 14.3467 8.875 14.0625 8.875H14.3789ZM4.5 14.5C4.5 15.3285 3.8252 16 3 16C2.1748 16 1.5 15.3285 1.5 14.5C1.5 13.6716 2.1748 13 3 13C3.8252 13 4.5 13.6716 4.5 14.5ZM13.5 14.5C13.5 15.3285 12.8252 16 12 16C11.1748 16 10.5 15.3285 10.5 14.5C10.5 13.6716 11.1748 13 12 13C12.8252 13 13.5 13.6716 13.5 14.5Z" fill="currentColor"/>
      </svg>`;

      // Add text label with responsive display
      const textSpan = document.createElement('span');
      textSpan.className = 'cart-btn-text';
      textSpan.innerText = isAddedToCart ? 'View Cart' : 'Add to Cart';

      // Add title attribute for accessibility when text is hidden
      cartButton.setAttribute(
        'title',
        isAddedToCart ? 'View Cart' : 'Add to Cart'
      );

      // Add click handler
      if (isAddedToCart) {
        // If in cart, redirect to cart on click
        cartButton.addEventListener('click', () => {
          window.location.href = '/cart';
        });
      } else {
        // Otherwise add to cart
        cartButton.addEventListener('click', () => {
          if (product.status !== 'out-of-stock') {
            dispatch(add_cart_product(product));
          }
        });
      }

      // Append text to button
      cartButton.appendChild(textSpan);

      // Append to price wrapper
      priceWrapper.appendChild(cartButton);
    }, 100);
  };

  return (
    <div className={styles.productCard} ref={cardRef}>
      <div className={styles.productCardInner} ref={addCartButtonToPrice}>
        <ProductItem product={formattedProduct} />
      </div>
    </div>
  );
};

export default ProductItemWrapper;
