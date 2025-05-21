import { createSlice } from '@reduxjs/toolkit';
import { getLocalStorage, setLocalStorage } from '@/utils/localstorage';
import { notifyError, notifySuccess } from '@/utils/toast';

const initialState = {
  cart_products: [],
  orderQuantity: 1,
  cartMiniOpen: false,
  totalShippingCost: 0,
  shippingDiscount: 0,
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

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    add_cart_product: (state, { payload }) => {
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

      // Update shipping costs
      updateShippingCosts(state);

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

      // Update shipping costs
      updateShippingCosts(state);

      setLocalStorage('cart_products', state.cart_products);
      setLocalStorage('shipping_cost', state.totalShippingCost);
    },
    remove_product: (state, { payload }) => {
      state.cart_products = state.cart_products.filter(
        item => item._id !== payload.id
      );

      // Update shipping costs
      updateShippingCosts(state);

      setLocalStorage('cart_products', state.cart_products);
      setLocalStorage('shipping_cost', state.totalShippingCost);
      notifyError(`${payload.title} Remove from cart`);
    },
    get_cart_products: (state, action) => {
      state.cart_products = getLocalStorage('cart_products');

      // Update shipping costs when getting cart products
      updateShippingCosts(state);
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
      }

      setLocalStorage('cart_products', state.cart_products);
      setLocalStorage('shipping_cost', state.totalShippingCost);
    },
    openCartMini: (state, { payload }) => {
      state.cartMiniOpen = true;
    },
    closeCartMini: (state, { payload }) => {
      state.cartMiniOpen = false;
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
} = cartSlice.actions;
export default cartSlice.reducer;
