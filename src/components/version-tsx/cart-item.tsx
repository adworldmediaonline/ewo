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

export default function CartItem({ product }: { product: any }) {
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
  const handleAddProduct = (prd: any) => {
    dispatch(add_cart_product(prd));
  };
  // handle decrement product
  const handleDecrement = (prd: any) => {
    dispatch(quantityDecrement(prd));
  };

  // handle remove product
  const handleRemovePrd = (prd: { title: string; id: string }) => {
    dispatch(remove_product(prd));
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-shrink-0">
          <Link href={`/product/${_id}`}>
            <div className="bg-gray-100 rounded-md overflow-hidden">
              <Image
                src={img}
                alt={title}
                width={80}
                height={80}
                className="object-cover w-20 h-20"
              />
            </div>
          </Link>
        </div>

        <div className="flex-grow">
          <Link
            href={`/product/${_id}`}
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            {title}
          </Link>

          {selectedOption && (
            <div className="text-sm text-muted-foreground mt-1">
              Option: {selectedOption.title} (+$
              {Number(selectedOption.price).toFixed(2)})
            </div>
          )}

          <div className="text-sm text-muted-foreground mt-1">
            ${price.toFixed(2)} each
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm text-muted-foreground">Qty:</label>
            <div className="flex items-center border rounded-md">
              <button
                onClick={() => handleDecrement(product)}
                className="p-1 hover:bg-gray-100 rounded-l-md disabled:opacity-50"
                aria-label="Decrease quantity"
                disabled={orderQuantity <= 1}
              >
                <Minus />
              </button>
              <input
                className="w-12 text-center border-0 focus:ring-0 py-1"
                type="text"
                value={orderQuantity}
                readOnly
              />
              <button
                onClick={() => handleAddProduct(product)}
                className="p-1 hover:bg-gray-100 rounded-r-md"
                aria-label="Increase quantity"
              >
                <Plus />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="font-medium">
              ${(price * orderQuantity).toFixed(2)}
            </div>
            <button
              onClick={() => handleRemovePrd({ title, id: _id })}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove item"
            >
              <Close />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
