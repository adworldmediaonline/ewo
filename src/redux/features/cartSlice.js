import { createSlice } from '@reduxjs/toolkit';
import { getLocalStorage, setLocalStorage } from '@/utils/localstorage';
import { notifyError, notifySuccess } from '@/utils/toast';

const initialState = {
  cart_products: [],
  orderQuantity: 1,
  cartMiniOpen: false,
  totalShippingCost: 0,
  shippingDiscount: 0,
  // First-time discount state
  firstTimeDiscount: {
    isEligible: true,
    isApplied: false,
    percentage: 10,
    showCelebration: false,
  },
};

// Helper function to check if user is first-time customer
const checkFirstTimeCustomer = () => {
  // Use direct localStorage access to avoid the getLocalStorage function's default behavior
  const hasReceivedDiscount = localStorage.getItem('first_time_discount_used');
  return !hasReceivedDiscount; // Returns true if null/undefined (first time)
};

// Helper function to mark discount as used (should only be called on order completion)
const markDiscountAsUsed = () => {
  localStorage.setItem('first_time_discount_used', 'true');
};

// Helper function to calculate shipping discount
const calculateShippingDiscount = items => {
  const itemCount = items.reduce(
    (total, item) => total + item.orderQuantity,
    0
  );

  if (itemCount <= 2) return 0; // No discount
  if (itemCount === 3) return 0.5; // 50% discount
  if (itemCount === 4) return 0.4; // 40% discount
  return 0.33; // 33% discount for 5 or more
};

// Helper function to calculate total shipping cost
const calculateTotalShipping = (items, discount) => {
  const totalShipping = items.reduce((total, item) => {
    const itemShipping = item.shipping?.price || 0;
    return total + itemShipping * item.orderQuantity;
  }, 0);

  // Apply discount and fix to 2 decimal places to avoid floating point errors
  const discountedTotal = totalShipping * (1 - discount);
  return parseFloat(discountedTotal.toFixed(2));
};

// Helper to update shipping costs
const updateShippingCosts = state => {
  const discount = calculateShippingDiscount(state.cart_products);
  state.shippingDiscount = discount;
  state.totalShippingCost = calculateTotalShipping(
    state.cart_products,
    discount
  );
};

// Helper to update first-time discount eligibility
const updateFirstTimeDiscount = state => {
  const isFirstTime = checkFirstTimeCustomer();
  const hasProducts = state.cart_products.length > 0;

  console.log('💰 First-time discount check:', {
    isFirstTime,
    hasProducts,
    currentIsApplied: state.firstTimeDiscount.isApplied,
  });

  state.firstTimeDiscount.isEligible = isFirstTime;
  state.firstTimeDiscount.isApplied = isFirstTime && hasProducts;
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    add_cart_product: (state, { payload }) => {
      // Check if this is the first product being added to cart
      const isFirstProduct = state.cart_products.length === 0;
      const isFirstTimeCustomer = checkFirstTimeCustomer();

      console.log('🎯 Add to cart debug:', {
        isFirstProduct,
        isFirstTimeCustomer,
        cartLength: state.cart_products.length,
        hasDiscountUsed: localStorage.getItem('first_time_discount_used'),
      });

      // Create unique identifier that includes selected option if present
      const productId = payload.selectedOption
        ? `${payload._id}-option-${payload.selectedOption.title}`
        : payload._id;

      // Check if this exact product with the same option already exists in cart
      const isExist = state.cart_products.some(item => {
        const itemId = item.selectedOption
          ? `${item._id}-option-${item.selectedOption.title}`
          : item._id;
        return itemId === productId;
      });

      if (!isExist) {
        const newItem = {
          ...payload,
          orderQuantity: state.orderQuantity,
          // If a final price is provided (when option is selected), use it
          ...(payload.finalPrice && { price: parseFloat(payload.finalPrice) }),
        };
        state.cart_products.push(newItem);

        // Create notification message that includes option if selected
        let message = `${state.orderQuantity} ${payload.title}`;
        if (payload.selectedOption) {
          message += ` (${payload.selectedOption.title})`;
        }
        message += ' added to cart';

        notifySuccess(message);

        // Trigger celebration for first product added by first-time customer
        if (isFirstProduct && isFirstTimeCustomer) {
          console.log('🎉 Triggering first-time celebration!');
          state.firstTimeDiscount.showCelebration = true;
          state.cartMiniOpen = true; // Open cart mini to show the celebration
          // DO NOT mark discount as used here - wait until order completion
        } else if (isFirstProduct) {
          // Even if not first-time customer, open cart mini for first product
          state.cartMiniOpen = true;
        }
      } else {
        state.cart_products = state.cart_products.map(item => {
          const itemId = item.selectedOption
            ? `${item._id}-option-${item.selectedOption.title}`
            : item._id;

          if (itemId === productId) {
            if (item.quantity >= item.orderQuantity + state.orderQuantity) {
              item.orderQuantity =
                state.orderQuantity !== 1
                  ? state.orderQuantity + item.orderQuantity
                  : item.orderQuantity + 1;

              // Create notification message that includes option if selected
              let message = `${state.orderQuantity} ${item.title}`;
              if (item.selectedOption) {
                message += ` (${item.selectedOption.title})`;
              }
              message += ' added to cart';

              notifySuccess(message);
            } else {
              notifyError('No more quantity available for this product!');
              state.orderQuantity = 1;
            }
          }
          return { ...item };
        });
      }

      // Update shipping costs and first-time discount
      updateShippingCosts(state);
      updateFirstTimeDiscount(state);

      console.log('🔄 Updated first-time discount state:', {
        isEligible: state.firstTimeDiscount.isEligible,
        isApplied: state.firstTimeDiscount.isApplied,
        showCelebration: state.firstTimeDiscount.showCelebration,
        percentage: state.firstTimeDiscount.percentage,
      });

      setLocalStorage('cart_products', state.cart_products);
      setLocalStorage('shipping_cost', state.totalShippingCost);
    },
    increment: (state, { payload }) => {
      state.orderQuantity = state.orderQuantity + 1;
    },
    decrement: (state, { payload }) => {
      state.orderQuantity =
        state.orderQuantity > 1
          ? state.orderQuantity - 1
          : (state.orderQuantity = 1);
    },
    quantityDecrement: (state, { payload }) => {
      state.cart_products.map(item => {
        if (item._id === payload._id) {
          if (item.orderQuantity > 1) {
            item.orderQuantity = item.orderQuantity - 1;
          }
        }
        return { ...item };
      });

      // Update shipping costs and first-time discount
      updateShippingCosts(state);
      updateFirstTimeDiscount(state);

      setLocalStorage('cart_products', state.cart_products);
      setLocalStorage('shipping_cost', state.totalShippingCost);
    },
    remove_product: (state, { payload }) => {
      state.cart_products = state.cart_products.filter(
        item => item._id !== payload.id
      );

      // Update shipping costs and first-time discount
      updateShippingCosts(state);
      updateFirstTimeDiscount(state);

      setLocalStorage('cart_products', state.cart_products);
      setLocalStorage('shipping_cost', state.totalShippingCost);
      notifyError(`${payload.title} Remove from cart`);
    },
    get_cart_products: (state, action) => {
      state.cart_products = getLocalStorage('cart_products');
      // Always keep cartMiniOpen as false on page load for better UX
      state.cartMiniOpen = false;
      // Clear any lingering celebration state on page load
      state.firstTimeDiscount.showCelebration = false;

      // Update shipping costs and first-time discount when getting cart products
      updateShippingCosts(state);
      updateFirstTimeDiscount(state);
    },
    initialOrderQuantity: (state, { payload }) => {
      state.orderQuantity = 1;
    },
    clearCart: state => {
      const isClearCart = window.confirm(
        'Are you sure you want to remove all items ?'
      );
      if (isClearCart) {
        state.cart_products = [];
        state.totalShippingCost = 0;
        state.shippingDiscount = 0;

        // Reset first-time discount state
        updateFirstTimeDiscount(state);
      }

      setLocalStorage('cart_products', state.cart_products);
      setLocalStorage('shipping_cost', state.totalShippingCost);
    },
    openCartMini: (state, { payload }) => {
      state.cartMiniOpen = true;
      setLocalStorage('cartMiniOpen', true);
    },
    closeCartMini: (state, { payload }) => {
      state.cartMiniOpen = false;
      setLocalStorage('cartMiniOpen', false);
      // Also hide celebration when closing cart mini
      state.firstTimeDiscount.showCelebration = false;
    },
    // New action to hide celebration
    hideCelebration: state => {
      state.firstTimeDiscount.showCelebration = false;
    },
    // Action to reset first-time discount (for testing purposes)
    resetFirstTimeDiscount: state => {
      localStorage.removeItem('first_time_discount_used');
      state.firstTimeDiscount.isEligible = true;
      state.firstTimeDiscount.isApplied = state.cart_products.length > 0;
      state.firstTimeDiscount.showCelebration = false;
      console.log('🔄 First-time discount reset!');
    },
    // Action to mark first-time discount as completed after order
    completeFirstTimeDiscount: state => {
      localStorage.setItem('first_time_discount_used', 'true');
      state.firstTimeDiscount.isEligible = false;
      state.firstTimeDiscount.isApplied = false;
      state.firstTimeDiscount.showCelebration = false;
      console.log('✅ First-time discount marked as completed!');
    },
  },
});

export const {
  add_cart_product,
  increment,
  decrement,
  get_cart_products,
  remove_product,
  quantityDecrement,
  initialOrderQuantity,
  clearCart,
  closeCartMini,
  openCartMini,
  hideCelebration,
  resetFirstTimeDiscount,
  completeFirstTimeDiscount,
} = cartSlice.actions;
export default cartSlice.reducer;
