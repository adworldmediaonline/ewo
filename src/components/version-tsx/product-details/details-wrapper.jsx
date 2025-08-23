'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { replaceTextCharacters } from '@/lib/replaceTextCharacters';
import {
  add_cart_product,
  increment,
  initialOrderQuantity,
  update_product_option,
} from '@/redux/features/cartSlice';
import { add_to_compare } from '@/redux/features/compareSlice';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import { notifyError, notifySuccess } from '@/utils/toast';
import {
  BarChart3,
  CheckCircle,
  FileText,
  Heart,
  MessageSquare,
  Package,
  ShoppingCart,
  Star,
  Tag,
  Truck,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProductDetailsCountdown from './product-details-countdown';
import ProductQuantity from './product-quantity';
import ReviewForm from './review-form';
import ReviewItem from './review-item';

// Custom Rating Component
const ProductRating = ({ rating, reviewCount }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className="w-5 h-5 text-yellow-400 fill-current"
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative w-5 h-5">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <div
              className="absolute inset-0 bg-background"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            >
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="w-5 h-5 text-muted-foreground/30"
          />
        ))}
      </div>

      {reviewCount > 0 && (
        <span className="text-sm text-muted-foreground">
          ({reviewCount} Review{reviewCount !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
};

export default function DetailsWrapper({
  productItem,
  handleImageActive,
  activeImg,
}) {
  const {
    sku,
    title,
    imageURLs,
    category,
    price,
    status,
    reviews,
    tags,
    offerDate,
    options,
    updatedPrice,
    finalPriceDiscount,
    description,
    specifications,
  } = productItem || {};
  const [ratingVal, setRatingVal] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const dispatch = useDispatch();
  const { orderQuantity, cart_products } = useSelector(state => state.cart);

  useEffect(() => {
    if (reviews && reviews.length > 0) {
      const rating =
        reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviews.length;
      setRatingVal(rating);
    } else {
      setRatingVal(0);
    }
  }, [reviews]);

  // Calculate final price using pre-calculated database values
  const calculateFinalPrice = () => {
    // Use pre-calculated finalPriceDiscount from database, fallback to original price
    const baseFinalPrice = finalPriceDiscount || price;

    // Add option price if an option is selected
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    return (Number(baseFinalPrice) + optionPrice).toFixed(2);
  };

  // Calculate marked up price for display using pre-calculated database values
  const calculateMarkedUpPrice = () => {
    // Use pre-calculated updatedPrice from database, fallback to original price
    const baseMarkedUpPrice = updatedPrice || price;

    // Add option price if an option is selected
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    return (Number(baseMarkedUpPrice) + optionPrice).toFixed(2);
  };

  // Handle option selection
  const handleOptionChange = e => {
    const optionIndex = e.target.value;
    if (optionIndex === '') {
      setSelectedOption(null);
    } else {
      setSelectedOption(options[parseInt(optionIndex)]);
    }
  };

  // handle add product
  const handleAddProduct = prd => {
    // Check if product has options but none are selected
    if (options && options.length > 0 && !selectedOption) {
      notifyError(
        'Please select an option before adding the product to your cart.'
      );
      return;
    }

    // Check if product already exists in cart (regardless of option)
    const existingProduct = cart_products.find(item => item._id === prd._id);

    // If product exists, check if option has changed
    const optionChanged =
      existingProduct &&
      JSON.stringify(existingProduct.selectedOption) !==
        JSON.stringify(selectedOption);

    // Get current quantity from existing product
    const currentQty = existingProduct ? existingProduct.orderQuantity : 0;

    // Determine final quantity based on whether option changed
    const finalQuantity = optionChanged
      ? currentQty
      : currentQty + orderQuantity;

    // If product has quantity limitation and requested quantity exceeds available
    if (prd.quantity && finalQuantity > prd.quantity) {
      notifyError(
        `Sorry, only ${prd.quantity} items available. ${
          existingProduct ? `You already have ${currentQty} in your cart.` : ''
        }`
      );
      return;
    }

    // If option changed, remove the existing product first
    if (optionChanged) {
      dispatch(
        update_product_option({
          id: existingProduct._id,
          title: existingProduct.title,
        })
      );

      // Reset order quantity to 1
      dispatch(initialOrderQuantity());

      // Increment to match the existing quantity
      for (let i = 1; i < currentQty; i++) {
        dispatch(increment());
      }
    }
    //
    // Use pre-calculated prices from database
    const finalSellingPrice = prd.finalPriceDiscount || prd.price;
    const markedUpPrice = prd.updatedPrice || prd.price;
    const originalPrice = Number(prd.price);

    const productToAdd = {
      ...prd,
      price: finalSellingPrice,
      originalPrice: originalPrice,
      markedUpPrice: markedUpPrice,
      selectedOption,
      // Replace the options array with only the selected option
      options: selectedOption ? [selectedOption] : [],
      // If an option is selected, update the final price to include the option price
      finalPrice: selectedOption ? calculateFinalPrice() : undefined,
    };

    dispatch(add_cart_product(productToAdd));

    // Show appropriate success message
    if (optionChanged) {
      notifySuccess(`Option updated to "${selectedOption?.title}"`);
    }

    // Reset the order quantity back to 1 for future additions
    if (optionChanged) {
      dispatch(initialOrderQuantity());
    }
  };

  // handle wishlist product
  const handleWishlistProduct = prd => {
    dispatch(add_to_wishlist(prd));
  };

  // handle compare product
  const handleCompareProduct = prd => {
    dispatch(add_to_compare(prd));
  };

  return (
    <div className="space-y-8">
      {/* Product Title */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
          {replaceTextCharacters(title, '*', '')}
        </h1>
      </div>

      {/* Rating and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <ProductRating rating={ratingVal} reviewCount={reviews?.length || 0} />

        <div className="flex items-center gap-2">
          {status === 'in-stock' ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">In Stock</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Out of Stock</span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-foreground">
            ${calculateFinalPrice()}
          </span>
          {updatedPrice && updatedPrice !== price && (
            <span className="text-lg text-muted-foreground line-through">
              ${calculateMarkedUpPrice()}
            </span>
          )}
        </div>

        {selectedOption && (
          <Badge variant="secondary" className="text-sm">
            {selectedOption.title}
          </Badge>
        )}
      </div>

      {/* Color Options */}
      {imageURLs?.some(item => item?.color && item?.color?.name) && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Color</h3>
          <div className="flex flex-wrap gap-3">
            {imageURLs
              .filter(item => item?.color && item?.color?.name)
              .map((item, i) => (
                <button
                  onClick={() => handleImageActive(item)}
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-border hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  style={{ backgroundColor: item?.color?.clrCode }}
                  title={item?.color?.name}
                  aria-label={`Select color ${item?.color?.name}`}
                />
              ))}
          </div>
        </div>
      )}

      {/* Countdown Timer */}
      {offerDate?.endDate && (
        <ProductDetailsCountdown offerExpiryTime={offerDate?.endDate} />
      )}

      {/* Product Options */}
      {options && options.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-medium text-foreground">Options</h3>

          <div className="relative">
            <select
              className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-primary transition-all"
              onChange={handleOptionChange}
              value={
                selectedOption ? options.indexOf(selectedOption).toString() : ''
              }
            >
              <option value="">Choose an option...</option>
              {options.map((option, index) => (
                <option key={index} value={index}>
                  {option.title}
                  {option.price && Number(option.price) !== 0
                    ? ` (+$${Number(option.price).toFixed(2)})`
                    : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Add to Cart Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <ProductQuantity productItem={productItem} />
          <Button
            onClick={() => handleAddProduct(productItem)}
            disabled={status === 'out-of-stock'}
            size="lg"
            className="flex-1 h-12 text-base font-medium"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => handleWishlistProduct(productItem)}
          variant="outline"
          size="lg"
          className="flex-1 sm:flex-none"
        >
          <Heart className="w-5 h-5 mr-2" />
          Add to Wishlist
        </Button>
        <Button
          onClick={() => handleCompareProduct(productItem)}
          variant="outline"
          size="lg"
          className="flex-1 sm:flex-none"
        >
          <BarChart3 className="w-5 h-5 mr-2" />
          Add to Compare
        </Button>
      </div>

      <Separator />

      {/* Product Details */}
      <div className="space-y-4">
        {sku && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="w-4 h-4" />
            <span>SKU: {sku}</span>
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Tags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Product Information Accordion - Desktop */}
      <div className="hidden lg:block">
        <Accordion
          type="multiple"
          defaultValue={['description']}
          className="w-full"
        >
          <AccordionItem value="description" className="border-border/50">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Product Description</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4">
                <div
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reviews" className="border-border/50">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span>Customer Reviews</span>
                {reviews && reviews.length > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full ml-2">
                    {reviews.length}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4 space-y-6">
                {reviews && reviews.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {reviews.map((review, index) => (
                        <ReviewItem key={index} review={review} />
                      ))}
                    </div>
                    <Separator />
                    <ReviewForm productId={productItem?._id} />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No reviews yet</p>
                    <p className="text-sm text-muted-foreground">
                      Be the first to review this product!
                    </p>
                    <Separator className="my-6" />
                    <ReviewForm productId={productItem?._id} />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="shipping" className="border-border/50">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <span>Shipping Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-foreground">
                      30 days easy returns
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-foreground">
                      Secure payments with leading payment providers
                    </span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Product Information Accordion - Mobile */}
      <div className="lg:hidden">
        <Accordion
          type="multiple"
          defaultValue={['description']}
          className="w-full"
        >
          <AccordionItem value="description" className="border-border/50">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Product Description</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4">
                <div
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reviews" className="border-border/50">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span>Customer Reviews</span>
                {reviews && reviews.length > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full ml-2">
                    {reviews.length}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4 space-y-6">
                {reviews && reviews.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {reviews.map((review, index) => (
                        <ReviewItem key={index} review={review} />
                      ))}
                    </div>
                    <Separator />
                    <ReviewForm productId={productItem?._id} />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No reviews yet</p>
                    <p className="text-sm text-muted-foreground">
                      Be the first to review this product!
                    </p>
                    <Separator className="my-6" />
                    <ReviewForm productId={productItem?._id} />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="shipping" className="border-border/50">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <span>Shipping Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-foreground">
                      30 days easy returns
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-foreground">
                      Secure payments with leading payment providers
                    </span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
