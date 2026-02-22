'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  add_cart_product,
  quantityDecrement,
} from '@/redux/features/cartSlice';
import { remove_wishlist_product } from '@/redux/features/wishlist-slice';
import { useProductCoupon } from '@/hooks/useProductCoupon';
import { Eye, Minus, Plus, ShoppingCart, Trash2, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import * as React from 'react';
import ProductConfigurationDialog from '@/components/version-tsx/product-configuration-dialog';
import { notifyError } from '@/utils/toast';

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
  sku?: string;
  quantity?: number;
  shipping?: {
    price: number;
    description?: string;
  };
  selectedOption?: {
    title: string;
    price: number;
  };
  options?: Array<{
    title: string;
    price: number;
  }>;
  productConfigurations?: Array<{
    title: string;
    options: Array<{
      name: string;
      price: number;
      isSelected: boolean;
    }>;
  }>;
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
    selectedOption: savedSelectedOption,
    options,
    productConfigurations,
  } = product || {};
  const { cart_products } = useSelector((state: any) => state.cart);
  const isAddToCart = cart_products.find((item: any) => item._id === _id);
  const dispatch = useDispatch();

  // Restore selectedOption from saved product data
  const [selectedOption, setSelectedOption] = React.useState<any>(
    savedSelectedOption || null
  );
  const [isConfigDialogOpen, setIsConfigDialogOpen] = React.useState(false);

  // Update selectedOption when saved product data changes
  React.useEffect(() => {
    if (savedSelectedOption) {
      setSelectedOption(savedSelectedOption);
    }
  }, [savedSelectedOption]);

  // Check if product has configurations
  const hasConfigurations = React.useMemo(() => {
    const configs = productConfigurations;

    if (!configs || !Array.isArray(configs) || configs.length === 0) {
      return false;
    }

    // Check if at least one configuration has options
    const hasValidConfigs = configs.some(
      (config: any) =>
        config &&
        config.options &&
        Array.isArray(config.options) &&
        config.options.length > 0
    );

    return hasValidConfigs;
  }, [productConfigurations]);

  // Check if coupon is active for this product (when auto-apply is enabled)
  const baseUnitPrice = Number(finalPriceDiscount || price || 0);
  const { hasCoupon, couponPercentage } = useProductCoupon(_id, baseUnitPrice);

  // Calculate final selling price (bold) - finalPriceDiscount after coupon discount
  const calculateFinalPrice = () => {
    // Get base price (original price, not discounted)
    const basePrice = finalPriceDiscount || price;

    // Apply coupon discount to base price FIRST (if coupon is active)
    let discountedBasePrice = Number(basePrice);
    if (hasCoupon && couponPercentage) {
      discountedBasePrice = basePrice * (1 - couponPercentage / 100);
    }

    // THEN add option price to the already discounted base price
    // No discount is applied to options - they're added at full price
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const finalPrice = discountedBasePrice + optionPrice;

    return finalPrice.toFixed(2);
  };

  // Calculate marked price (strikethrough) - finalPriceDiscount before coupon
  const calculateMarkedPrice = () => {
    const basePrice = finalPriceDiscount || price;
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    return (Number(basePrice) + optionPrice).toFixed(2);
  };

  // handle add product
  const handleAddProduct = (prd: WishlistProduct) => {
    // If product has configurations, open dialog instead
    if (hasConfigurations) {
      setIsConfigDialogOpen(true);
      return;
    }

    // Check if product has options but none are selected
    if (options && options.length > 0 && !selectedOption) {
      notifyError(
        'Please select an option before adding the product to your cart.'
      );
      return;
    }

    // Calculate final price
    // Get base price (original price, not discounted)
    const basePrice = prd.finalPriceDiscount || prd.price;

    // Apply coupon discount to base price FIRST (if coupon is active)
    let discountedBasePrice = Number(basePrice);
    if (hasCoupon && couponPercentage) {
      discountedBasePrice = basePrice * (1 - couponPercentage / 100);
    }

    // THEN add option price to the already discounted base price
    // No discount is applied to options - they're added at full price
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const finalPrice = discountedBasePrice + optionPrice;

    const cartProduct = {
      ...prd,
      orderQuantity: 1,
      quantity: prd.quantity || 1,
      finalPriceDiscount: finalPrice,
      sku: prd.sku || prd._id,
      shipping: prd.shipping || { price: 0 },
      selectedOption: selectedOption || undefined,
    };
    dispatch(add_cart_product(cartProduct));
  };

  const handleChooseOptions = () => {
    setIsConfigDialogOpen(true);
  };

  const handleOptionChange = (value: string) => {
    if (value === '') {
      setSelectedOption(null);
    } else {
      const optionIndex = parseInt(value);
      setSelectedOption(options?.[optionIndex] || null);
    }
  };

  // handle decrement product
  const handleDecrement = (prd: WishlistProduct) => {
    // Calculate final price
    // Get base price (original price, not discounted)
    const basePrice = prd.finalPriceDiscount || prd.price;

    // Apply coupon discount to base price FIRST (if coupon is active)
    let discountedBasePrice = Number(basePrice);
    if (hasCoupon && couponPercentage) {
      discountedBasePrice = basePrice * (1 - couponPercentage / 100);
    }

    // THEN add option price to the already discounted base price
    // No discount is applied to options - they're added at full price
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const finalPrice = discountedBasePrice + optionPrice;

    const cartProduct = {
      ...prd,
      orderQuantity: 1,
      quantity: prd.quantity || 1,
      finalPriceDiscount: finalPrice,
      sku: prd.sku || prd._id,
      shipping: prd.shipping || { price: 0 },
      selectedOption: selectedOption || undefined,
    };
    dispatch(quantityDecrement(cartProduct));
  };

  // handle remove product
  const handleRemovePrd = (prd: { title: string; id: string }) => {
    dispatch(remove_wishlist_product(prd));
  };

  return (
    <>
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

                {/* Options Selection */}
                {options && options.length > 0 && (
                  <div className="w-full max-w-xs">
                    <Select
                      onValueChange={handleOptionChange}
                      value={
                        selectedOption
                          ? (() => {
                              // Find matching option by title and price
                              const matchedIndex = options.findIndex(
                                opt =>
                                  opt.title === selectedOption.title &&
                                  Number(opt.price) === Number(selectedOption.price)
                              );
                              return matchedIndex >= 0 ? matchedIndex.toString() : '';
                            })()
                          : ''
                      }
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select option..." />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option, index) => (
                          <SelectItem
                            key={index}
                            value={index.toString()}
                            className="text-xs"
                          >
                            {option.title}
                            {option.price && Number(option.price) !== 0
                              ? ` (+$${Number(option.price).toFixed(2)})`
                              : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2">
                  {hasCoupon && couponPercentage && (
                    <span className="text-sm text-muted-foreground line-through font-medium">
                      ${calculateMarkedPrice()}
                    </span>
                  )}
                  <span className="text-xl font-bold text-primary">
                    ${calculateFinalPrice()}
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
                  {hasConfigurations ? (
                    <Button
                      onClick={handleChooseOptions}
                      className="flex items-center gap-2 px-4 py-2 h-auto text-sm font-medium"
                      disabled={status === 'out-of-stock'}
                      size="sm"
                    >
                      <Settings className="w-4 h-4" />
                      Choose Options
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleAddProduct(product)}
                      className="flex items-center gap-2 px-4 py-2 h-auto text-sm font-medium"
                      disabled={status === 'out-of-stock'}
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {isAddToCart ? 'Update' : 'Add to Cart'}
                    </Button>
                  )}

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

    {/* Configuration Dialog */}
    {hasConfigurations && (
      <ProductConfigurationDialog
        product={{
          ...product,
          sku: product.sku || product._id,
          category: product.category || { name: '', id: '' },
          status: product.status || 'in-stock',
          quantity: product.quantity || 0,
        } as any}
        open={isConfigDialogOpen}
        onOpenChange={setIsConfigDialogOpen}
        onAddToCart={(productWithPrice: any, selectedOption?: any) => {
          const cartProduct = {
            ...productWithPrice,
            orderQuantity: 1,
            quantity: productWithPrice.quantity || 1,
            sku: productWithPrice.sku || productWithPrice._id,
            shipping: productWithPrice.shipping || product.shipping || { price: 0 },
            selectedOption: selectedOption || undefined,
          };
          dispatch(add_cart_product(cartProduct));
        }}
      />
    )}
  </>
  );
}
