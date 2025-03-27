import { createSlice } from '@reduxjs/toolkit';
import { getLocalStorage, setLocalStorage } from '@/utils/localstorage';
import { notifyError, notifySuccess } from '@/utils/toast';

const initialState = {
  cart_products: [],
  orderQuantity: 1,
  cartMiniOpen: false,
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
      setLocalStorage('cart_products', state.cart_products);
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
      setLocalStorage('cart_products', state.cart_products);
    },
    remove_product: (state, { payload }) => {
      state.cart_products = state.cart_products.filter(
        item => item._id !== payload.id
      );
      setLocalStorage('cart_products', state.cart_products);
      notifyError(`${payload.title} Remove from cart`);
    },
    get_cart_products: (state, action) => {
      state.cart_products = getLocalStorage('cart_products');
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
      }
      setLocalStorage('cart_products', state.cart_products);
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
