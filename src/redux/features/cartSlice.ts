import { getLocalStorage, setLocalStorage } from '@/utils/localstorage';
import { notifyError } from '@/utils/toast';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface SelectedOption {
  title: string;
}

interface CartProduct {
  _id: string;
  title: string;
  img: string;
  sku: string;
  price: number | string;
  finalPriceDiscount: number | string;
  orderQuantity: number;
  quantity?: number;
  discount?: number | string;
  slug?: string;
  shipping?: { price?: number };
  selectedOption?: SelectedOption;
}

interface FirstTimeDiscountState {
  isEligible: boolean;
  isApplied: boolean;
  percentage: number;
  showCelebration?: boolean;
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
  totalShippingCost: number;
  shippingDiscount: number;
  firstTimeDiscount: FirstTimeDiscountState;
  showCartConfirmation: boolean;
  lastAddedProduct: LastAddedProduct | null;
}

const initialState: CartState = {
  cart_products: [],
  orderQuantity: 1,
  cartMiniOpen: false,
  totalShippingCost: 0,
  shippingDiscount: 0,
  firstTimeDiscount: {
    isEligible: true,
    isApplied: false,
    percentage: 15,
    showCelebration: false,
  },
  showCartConfirmation: false,
  lastAddedProduct: null,
};

// Helper function to check if user is first-time customer
const checkFirstTimeCustomer = (): boolean => {
  // Use direct localStorage access to avoid the getLocalStorage function's default behavior
  const hasReceivedDiscount = localStorage.getItem('first_time_discount_used');
  return !hasReceivedDiscount; // Returns true if null/undefined (first time)
};

// Helper function to mark discount as used (should only be called on order completion)
// const markDiscountAsUsed = (): void => {
//   localStorage.setItem('first_time_discount_used', 'true');
// };

// Helper function to calculate shipping discount
const calculateShippingDiscount = (items: CartProduct[]): number => {
  const itemCount = items.reduce(
    (total: number, item: CartProduct) =>
      total + (Number(item.orderQuantity) || 0),
    0
  );

  if (itemCount <= 2) return 0; // No discount
  if (itemCount === 3) return 0.5; // 50% discount
  if (itemCount === 4) return 0.4; // 40% discount
  return 0.33; // 33% discount for 5 or more
};

// Helper function to calculate total shipping cost
const calculateTotalShipping = (
  items: CartProduct[],
  discount: number
): number => {
  const totalShipping = items.reduce((total: number, item: CartProduct) => {
    const itemShipping = Number(item.shipping?.price || 0);
    return total + itemShipping * Number(item.orderQuantity || 0);
  }, 0);

  // Apply discount and fix to 2 decimal places to avoid floating point errors
  const discountedTotal = totalShipping * (1 - discount);
  return parseFloat(discountedTotal.toFixed(2));
};

// Helper to update shipping costs
const updateShippingCosts = (state: CartState): void => {
  const discount = calculateShippingDiscount(state.cart_products);
  state.shippingDiscount = discount;

  state.totalShippingCost = calculateTotalShipping(
    state.cart_products,
    discount
  );
};

// Helper to update first-time discount eligibility
const updateFirstTimeDiscount = (state: CartState): void => {
  const isFirstTime = checkFirstTimeCustomer();
  const hasProducts = state.cart_products.length > 0;

  state.firstTimeDiscount.isEligible = isFirstTime;
  state.firstTimeDiscount.isApplied = isFirstTime && hasProducts;
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    add_cart_product: (state, { payload }: PayloadAction<CartProduct>) => {
      // Check if this is the first product being added to cart
      // const isFirstProduct = state.cart_products.length === 0;
      // const isFirstTimeCustomer = checkFirstTimeCustomer();

      // Create unique identifier that includes selected option if present
      const productId = payload.selectedOption
        ? `${payload._id}-option-${payload.selectedOption.title}`
        : payload._id;

      // Check if this exact product with the same option already exists in cart
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
          // If a final price is provided (when option is selected), use it
          ...(payload.finalPriceDiscount && {
            price: parseFloat(String(payload.finalPriceDiscount)),
          }),
        };
        state.cart_products.push(newItem);

        // Show cart confirmation modal
        state.showCartConfirmation = true;
        state.lastAddedProduct = {
          title: payload.title,
          img: payload.img,
          selectedOption: payload.selectedOption,
          orderQuantity: state.orderQuantity,
        };

        // Cart confirmation modal will handle user feedback - no toast needed

        // if (isFirstProduct) {
        //   // Open cart mini for first product
        //   state.cartMiniOpen = true;
        // }
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

              // Show cart confirmation modal
              state.showCartConfirmation = true;
              state.lastAddedProduct = {
                title: item.title,
                img: item.img,
                selectedOption: item.selectedOption,
                orderQuantity: state.orderQuantity,
              };

              // Cart confirmation modal will handle user feedback - no toast needed
            } else {
              notifyError('No more quantity available for this product!');
              state.orderQuantity = 1;
            }
          }
          return { ...item } as CartProduct;
        });
      }

      // Update shipping costs and first-time discount
      updateShippingCosts(state);
      updateFirstTimeDiscount(state);

      setLocalStorage('cart_products', state.cart_products);
      setLocalStorage('shipping_cost', state.totalShippingCost);
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

      // Update shipping costs and first-time discount
      updateShippingCosts(state);
      updateFirstTimeDiscount(state);

      setLocalStorage('cart_products', state.cart_products);
      setLocalStorage('shipping_cost', state.totalShippingCost);
    },
    remove_product: (
      state,
      { payload }: PayloadAction<{ id: string; title: string }>
    ) => {
      state.cart_products = state.cart_products.filter(
        (item: CartProduct) => item._id !== payload.id
      );

      // Update shipping costs and first-time discount
      updateShippingCosts(state);
      updateFirstTimeDiscount(state);

      setLocalStorage('cart_products', state.cart_products);
      setLocalStorage('shipping_cost', state.totalShippingCost);
      notifyError(`${payload.title} Remove from cart`);
    },
    update_product_option: (
      state,
      { payload }: PayloadAction<{ id: string }>
    ) => {
      state.cart_products = state.cart_products.filter(
        (item: CartProduct) => item._id !== payload.id
      );

      // Update shipping costs and first-time discount
      updateShippingCosts(state);
      updateFirstTimeDiscount(state);

      setLocalStorage('cart_products', state.cart_products);
      setLocalStorage('shipping_cost', state.totalShippingCost);
      // No toast notification for option updates - will be handled when new item is added
    },
    get_cart_products: state => {
      state.cart_products = (getLocalStorage('cart_products') ||
        []) as CartProduct[];
      // Always keep cartMiniOpen as false on page load for better UX
      state.cartMiniOpen = false;
      // Clear any lingering celebration state on page load
      state.firstTimeDiscount.showCelebration = false;
      // Only clear cart confirmation modal state if it's not currently showing
      // This preserves the modal state when items are added to cart
      // The modal will be cleared by hideCartConfirmation action or on user interaction
      if (!state.showCartConfirmation) {
        state.lastAddedProduct = null;
      }

      // Restore shipping cost from localStorage first
      const storedShippingCost = getLocalStorage('shipping_cost');
      if (storedShippingCost !== null && storedShippingCost !== undefined) {
        state.totalShippingCost = Number(storedShippingCost);
      }

      // Update shipping costs and first-time discount when getting cart products
      updateShippingCosts(state);
      updateFirstTimeDiscount(state);
    },
    initialOrderQuantity: state => {
      state.orderQuantity = 1;
    },
    clearCart: state => {
      state.cart_products = [];
      state.totalShippingCost = 0;
      state.shippingDiscount = 0;

      // Reset first-time discount state
      updateFirstTimeDiscount(state);

      setLocalStorage('cart_products', state.cart_products);
      setLocalStorage('shipping_cost', state.totalShippingCost);
    },
    openCartMini: state => {
      state.cartMiniOpen = true;
      setLocalStorage('cartMiniOpen', true);
    },
    closeCartMini: state => {
      state.cartMiniOpen = false;
      setLocalStorage('cartMiniOpen', false);
    },

    // Action to hide cart confirmation modal
    hideCartConfirmation: state => {
      state.showCartConfirmation = false;
      state.lastAddedProduct = null;
    },
    // Action to reset first-time discount (for testing purposes)
    resetFirstTimeDiscount: state => {
      localStorage.removeItem('first_time_discount_used');
      state.firstTimeDiscount.isEligible = true;
      state.firstTimeDiscount.isApplied = state.cart_products.length > 0;
    },
    // Action to mark first-time discount as completed after order
    completeFirstTimeDiscount: state => {
      localStorage.setItem('first_time_discount_used', 'true');
      state.firstTimeDiscount.isEligible = false;
      state.firstTimeDiscount.isApplied = false;
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
  resetFirstTimeDiscount,
  completeFirstTimeDiscount,
  update_product_option,
} = cartSlice.actions;
export default cartSlice.reducer;
