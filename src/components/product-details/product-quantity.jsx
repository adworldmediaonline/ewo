'use client';
import { useDispatch, useSelector } from 'react-redux';

// internal
import { decrement, increment } from '@/redux/features/cartSlice';
import { notifyError } from '@/utils/toast';

const ProductQuantity = ({ productItem }) => {
  const { orderQuantity, cart_products } = useSelector(state => state.cart);
  const dispatch = useDispatch();

  // handleIncrease
  const handleIncrease = () => {
    // Check if we have a product with quantity limitations
    if (productItem?.quantity) {
      // Check if product already exists in cart
      const existingProduct = cart_products.find(
        item => item._id === productItem._id
      );

      // Get total current quantity (existing + new)
      const currentQty = existingProduct ? existingProduct.orderQuantity : 0;
      const totalRequestedQty = currentQty + orderQuantity + 1; // +1 because we're increasing

      // If requested quantity exceeds available
      if (totalRequestedQty > productItem.quantity) {
        notifyError(
          `Sorry, only ${productItem.quantity} items available. You already have ${currentQty} in your cart.`
        );
        return;
      }
    }

    dispatch(increment());
  };

  // handleDecrease
  const handleDecrease = () => {
    dispatch(decrement());
  };

  return (
    <>
      <button
        className=""
        onClick={handleDecrease}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <input
        className=""
        type="text"
        readOnly
        value={orderQuantity}
        aria-label="Product quantity"
      />
      <button
        className=""
        onClick={handleIncrease}
        aria-label="Increase quantity"
      >
        +
      </button>
    </>
  );
};

export default ProductQuantity;
