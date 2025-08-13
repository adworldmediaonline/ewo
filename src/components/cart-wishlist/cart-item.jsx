'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
// internal
import {
  add_cart_product,
  quantityDecrement,
  remove_product,
} from '@/redux/features/cartSlice';
import { Close, Minus, Plus } from '@/svg';

export default function CartItem({ product }) {
  const {
    _id,
    img,
    title,
    price,
    orderQuantity = 0,
    selectedOption,
  } = product || {};

  const dispatch = useDispatch();

  // handle add product
  const handleAddProduct = prd => {
    dispatch(add_cart_product(prd));
  };
  // handle decrement product
  const handleDecrement = prd => {
    dispatch(quantityDecrement(prd));
  };

  // handle remove product
  const handleRemovePrd = prd => {
    dispatch(remove_product(prd));
  };

  return (
    <div className="">
      <div className="">
        <div className="">
          <div className="">
            <Link href={`/product/${_id}`}>
              <Image src={img} alt={title} width={80} height={80} />
            </Link>
          </div>
          <div className="">
            <Link href={`/product/${_id}`} className="">
              {title}
            </Link>
            {selectedOption && (
              <div className="">
                Option: {selectedOption.title} (+$
                {Number(selectedOption.price).toFixed(2)})
              </div>
            )}
            <div className="">${price.toFixed(2)} each</div>
          </div>
        </div>

        <div className="">
          <label className="">Quantity</label>
          <div className="">
            <button
              onClick={() => handleDecrement(product)}
              className=""
              aria-label="Decrease quantity"
            >
              <Minus />
            </button>
            <input className="" type="text" value={orderQuantity} readOnly />
            <button
              onClick={() => handleAddProduct(product)}
              className=""
              aria-label="Increase quantity"
            >
              <Plus />
            </button>
          </div>
        </div>

        <div className="">
          <div className="">${(price * orderQuantity).toFixed(2)}</div>
          <button
            onClick={() => handleRemovePrd({ title, id: _id })}
            className=""
            aria-label="Remove item"
          >
            <Close />
          </button>
        </div>
      </div>
    </div>
  );
}
