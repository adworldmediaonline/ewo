'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  add_cart_product,
  quantityDecrement,
} from '@/redux/features/cartSlice';
import { remove_wishlist_product } from '@/redux/features/wishlist-slice';
import { Eye, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';

interface WishlistProduct {
  _id: string;
  img: string;
  title: string;
  price: number;
  updatedPrice?: number;
  finalPriceDiscount?: number;
  status?: string;
  category?: {
    name: string;
  };
  slug: string;
}

export default function WishlistItem({
  product,
}: {
  product: WishlistProduct;
}) {
  const {
    _id,
    img,
    title,
    price,
    updatedPrice,
    finalPriceDiscount,
    status,
    category,
    slug,
  } = product || {};
  const { cart_products } = useSelector((state: any) => state.cart);
  const isAddToCart = cart_products.find((item: any) => item._id === _id);
  const dispatch = useDispatch();

  // handle add product
  const handleAddProduct = (prd: WishlistProduct) => {
    const cartProduct = {
      ...prd,
      orderQuantity: 1,
      quantity: 1,
      finalPriceDiscount: prd.finalPriceDiscount || prd.price,
    };
    dispatch(add_cart_product(cartProduct));
  };

  // handle decrement product
  const handleDecrement = (prd: WishlistProduct) => {
    const cartProduct = {
      ...prd,
      orderQuantity: 1,
      quantity: 1,
      finalPriceDiscount: prd.finalPriceDiscount || prd.price,
    };
    dispatch(quantityDecrement(cartProduct));
  };

  // handle remove product
  const handleRemovePrd = (prd: { title: string; id: string }) => {
    dispatch(remove_wishlist_product(prd));
  };

  const finalPrice = finalPriceDiscount || price;
  const hasDiscount = updatedPrice && updatedPrice !== price;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-border/50">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Product Image */}
          <div className="relative w-full sm:w-32 h-32 sm:h-32 flex-shrink-0 bg-muted">
            <Link href={`/product/${_id}`} className="block h-full">
              <Image
                src={img}
                alt={title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 640px) 100vw, 128px"
              />
            </Link>

            {/* Status Badge */}
            {status === 'out-of-stock' && (
              <Badge
                variant="destructive"
                className="absolute top-2 left-2 text-xs font-medium"
              >
                Out of Stock
              </Badge>
            )}

            {/* Discount Badge */}
            {/* {hasDiscount && (
              <Badge
                variant="secondary"
                className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-medium"
              >
                Sale
              </Badge>
            )} */}
          </div>

          {/* Product Info & Actions - Compact Layout */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left Side: Product Details */}
              <div className="flex-1 space-y-2 min-w-0">
                <Link href={`/product/${_id}`} className="block group">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {title}
                  </h3>
                </Link>

                {category?.name && (
                  <p className="text-sm text-muted-foreground font-medium">
                    {category.name}
                  </p>
                )}

                {/* Price */}
                <div className="flex items-center gap-3">
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through font-medium">
                      ${Number(updatedPrice).toFixed(2)}
                    </span>
                  )}
                  <span className="text-xl font-bold text-primary">
                    ${Number(finalPrice).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Right Side: Quantity & Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border-2 border-border rounded-lg overflow-hidden bg-background">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDecrement(product)}
                      className="h-8 w-8 p-0 rounded-none border-r border-border hover:bg-muted/50 transition-colors"
                      disabled={!isAddToCart || isAddToCart?.orderQuantity <= 0}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="px-3 py-1 text-sm font-semibold min-w-[2.5rem] text-center bg-muted/30">
                      {isAddToCart ? isAddToCart?.orderQuantity : 0}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddProduct(product)}
                      className="h-8 w-8 p-0 rounded-none border-l border-border hover:bg-muted/50 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isAddToCart ? 'bg-green-500' : 'bg-muted-foreground/30'
                      }`}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {isAddToCart ? 'In Cart' : 'Not in Cart'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons - Horizontal Layout */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleAddProduct(product)}
                    className="flex items-center gap-2 px-4 py-2 h-auto text-sm font-medium"
                    disabled={status === 'out-of-stock'}
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isAddToCart ? 'Update' : 'Add to Cart'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="px-4 py-2 h-auto text-sm font-medium"
                  >
                    <Link
                      href={`/product/${slug}`}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemovePrd({ title, id: _id })}
                    className="flex items-center gap-2 px-4 py-2 h-auto text-sm font-medium text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
