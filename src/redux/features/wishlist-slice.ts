import { getLocalStorage, setLocalStorage } from '@/utils/localstorage';
import { notifyError, notifySuccess } from '@/utils/toast';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface WishlistItem {
  _id: string;
  title: string;
  [key: string]: unknown;
}

interface WishlistState {
  wishlist: WishlistItem[];
}

const initialState: WishlistState = {
  wishlist: [],
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    add_to_wishlist: (state, { payload }: PayloadAction<WishlistItem>) => {
      const isExist = state.wishlist.some(item => item._id === payload._id);
      if (!isExist) {
        state.wishlist.push(payload);
        notifySuccess(`${payload.title} added to wishlist`);
      } else {
        state.wishlist = state.wishlist.filter(
          item => item._id !== payload._id
        );
        notifyError(`${payload.title} removed from wishlist`);
      }
      setLocalStorage('wishlist_items', state.wishlist);
    },
    remove_wishlist_product: (
      state,
      { payload }: PayloadAction<{ id: string; title: string }>
    ) => {
      state.wishlist = state.wishlist.filter(item => item._id !== payload.id);
      notifyError(`${payload.title} removed from wishlist`);
      setLocalStorage('wishlist_items', state.wishlist);
      notifyError(`${payload.title} removed from wishlist`);
    },
    get_wishlist_products: state => {
      state.wishlist = (getLocalStorage('wishlist_items') ||
        []) as WishlistItem[];
    },
  },
});

export const {
  add_to_wishlist,
  remove_wishlist_product,
  get_wishlist_products,
} = wishlistSlice.actions;
export default wishlistSlice.reducer;
