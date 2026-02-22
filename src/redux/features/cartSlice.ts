import { getLocalStorage, setLocalStorage } from '@/utils/localstorage';
import { notifyError } from '@/utils/toast';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface SelectedOption {
  title: string;
  price: number;
}

interface CartProduct {
  _id: string;
  title: string;
  img: string;
  sku: string;
  price?: number | string;
  finalPriceDiscount: number | string;
  orderQuantity: number;
  quantity?: number;
  slug?: string;
  selectedOption?: SelectedOption;
  basePrice?: number;
  shipping?: { price?: number };
  appliedCouponCode?: string;
}

interface LastAddedProduct {
  title: string;
  img: string;
  selectedOption?: SelectedOption;
  orderQuantity: number;
}

interface CartState {
  cart_products: CartProduct[];
  orderQuantity: number;
  cartMiniOpen: boolean;
  showCartConfirmation: boolean;
  lastAddedProduct: LastAddedProduct | null;
  couponCode: string | null;
  discountAmount: number;
  /** When true, discount was auto-applied (show "X% OFF applied" instead of discount line) */
  isAutoApplied: boolean;
}

const initialState: CartState = {
  cart_products: [],
  orderQuantity: 1,
  cartMiniOpen: false,
  showCartConfirmation: false,
  lastAddedProduct: null,
  couponCode: null,
  discountAmount: 0,
  isAutoApplied: false,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    add_cart_product: (state, { payload }: PayloadAction<CartProduct>) => {
      const productId = payload.selectedOption
        ? `${payload._id}-option-${payload.selectedOption.title}`
        : payload._id;

      const isExist = state.cart_products.some((item: CartProduct) => {
        const itemId = item.selectedOption
          ? `${item._id}-option-${item.selectedOption.title}`
          : item._id;
        return itemId === productId;
      });

      if (!isExist) {
        const newItem: CartProduct = {
          ...payload,
          orderQuantity: state.orderQuantity,
          ...(payload.finalPriceDiscount && {
            price: parseFloat(String(payload.finalPriceDiscount)),
          }),
        };

        state.cart_products.push(newItem);

        state.showCartConfirmation = true;
        state.lastAddedProduct = {
          title: payload.title,
          img: payload.img,
          selectedOption: payload.selectedOption,
          orderQuantity: state.orderQuantity,
        };
      } else {
        state.cart_products = state.cart_products.map((item: CartProduct) => {
          const itemId = item.selectedOption
            ? `${item._id}-option-${item.selectedOption.title}`
            : item._id;

          if (itemId === productId) {
            if (
              (Number(item.quantity) || 0) >=
              (Number(item.orderQuantity) || 0) + state.orderQuantity
            ) {
              item.orderQuantity =
                state.orderQuantity !== 1
                  ? state.orderQuantity + Number(item.orderQuantity || 0)
                  : Number(item.orderQuantity || 0) + 1;

              state.showCartConfirmation = true;
              state.lastAddedProduct = {
                title: item.title,
                img: item.img,
                selectedOption: item.selectedOption,
                orderQuantity: state.orderQuantity,
              };
            } else {
              notifyError('No more quantity available for this product!');
              state.orderQuantity = 1;
            }
          }
          return { ...item } as CartProduct;
        });
      }

      setLocalStorage('cart_products', state.cart_products);
    },
    increment: state => {
      state.orderQuantity = state.orderQuantity + 1;
    },
    decrement: state => {
      state.orderQuantity =
        state.orderQuantity > 1
          ? state.orderQuantity - 1
          : (state.orderQuantity = 1);
    },
    quantityDecrement: (state, { payload }: PayloadAction<CartProduct>) => {
      state.cart_products.map((item: CartProduct) => {
        if (item._id === payload._id) {
          if (Number(item.orderQuantity || 0) > 1) {
            item.orderQuantity = Number(item.orderQuantity || 0) - 1;
          }
        }
        return { ...item } as CartProduct;
      });

      setLocalStorage('cart_products', state.cart_products);
    },
    remove_product: (
      state,
      { payload }: PayloadAction<{ id: string; title: string }>
    ) => {
      state.cart_products = state.cart_products.filter(
        (item: CartProduct) => item._id !== payload.id
      );

      setLocalStorage('cart_products', state.cart_products);

      if (state.cart_products.length === 0) {
        state.showCartConfirmation = false;
        state.lastAddedProduct = null;
      }
    },
    update_product_option: (
      state,
      { payload }: PayloadAction<{ id: string }>
    ) => {
      state.cart_products = state.cart_products.filter(
        (item: CartProduct) => item._id !== payload.id
      );

      setLocalStorage('cart_products', state.cart_products);
    },
    get_cart_products: state => {
      const shouldShowModal = state.showCartConfirmation;
      const savedLastProduct = state.lastAddedProduct;

      state.cart_products = (getLocalStorage('cart_products') ||
        []) as CartProduct[];
      state.cartMiniOpen = false;

      if (shouldShowModal) {
        state.showCartConfirmation = true;
        state.lastAddedProduct = savedLastProduct;
      } else {
        state.lastAddedProduct = null;
      }
    },
    initialOrderQuantity: state => {
      state.orderQuantity = 1;
    },
    clearCart: state => {
      state.cart_products = [];
      state.showCartConfirmation = false;
      state.lastAddedProduct = null;
      state.couponCode = null;
      state.discountAmount = 0;
      state.isAutoApplied = false;

      setLocalStorage('cart_products', state.cart_products);
    },
    applyCoupon: (
      state,
      {
        payload,
      }: PayloadAction<{
        code: string;
        discountAmount: number;
        isAutoApplied?: boolean;
      }>
    ) => {
      state.couponCode = payload.code;
      state.discountAmount = payload.discountAmount;
      state.isAutoApplied = payload.isAutoApplied ?? false;
    },
    removeCoupon: state => {
      state.couponCode = null;
      state.discountAmount = 0;
      state.isAutoApplied = false;
    },
    openCartMini: state => {
      state.cartMiniOpen = true;
      setLocalStorage('cartMiniOpen', true);
    },
    closeCartMini: state => {
      state.cartMiniOpen = false;
      setLocalStorage('cartMiniOpen', false);
    },
    hideCartConfirmation: state => {
      state.showCartConfirmation = false;
      state.lastAddedProduct = null;
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
  hideCartConfirmation,
  update_product_option,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;
export default cartSlice.reducer;
