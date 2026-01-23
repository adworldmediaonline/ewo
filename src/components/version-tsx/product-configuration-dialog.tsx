'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ProductConfigurations from '@/components/version-tsx/product-details/product-configurations';
import {
  add_cart_product,
  initialOrderQuantity,
} from '@/redux/features/cartSlice';
import { notifyError } from '@/utils/toast';
import { useProductCoupon } from '@/hooks/useProductCoupon';
import type { Product } from '@/components/version-tsx/product-card';

interface ProductConfigurationDialogProps {
  product: Product & {
    productConfigurations?: Array<{
      title: string;
      options: Array<{
        name: string;
        price: number;
        priceType?: 'fixed' | 'percentage';
        percentage?: number;
        isPercentageIncrease?: boolean;
        isSelected: boolean;
        image?: string;
      }>;
      enableCustomNote?: boolean;
      customNotePlaceholder?: string;
      customNoteValue?: string;
    }>;
    options?: Array<{
      title: string;
      price: number;
    }>;
    updatedPrice?: number;
    finalPriceDiscount?: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart?: (product: Product, selectedOption?: any) => void;
}

export default function ProductConfigurationDialog({
  product,
  open,
  onOpenChange,
  onAddToCart,
}: ProductConfigurationDialogProps) {
  const dispatch = useDispatch();
  const { cart_products, orderQuantity } = useSelector((state: any) => state.cart);

  // Check if coupon is active for this product
  const { hasCoupon, couponPercentage } = useProductCoupon(product._id);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [customNotes, setCustomNotes] = useState<{
    [configIndex: number]: string;
  }>({});
  const [selectedConfigurations, setSelectedConfigurations] = useState<{
    [configIndex: number]: {
      optionIndex: number;
      option: {
        name: string;
        price: number;
        priceType?: 'fixed' | 'percentage';
        percentage?: number;
        isPercentageIncrease?: boolean;
        image?: string;
      };
    };
  }>(() => {
    // Initialize with preselected options from backend
    const initial: {
      [configIndex: number]: {
        optionIndex: number;
        option: { name: string; price: number };
      };
    } = {};
    if (product.productConfigurations && product.productConfigurations.length > 0) {
      product.productConfigurations.forEach((config, configIndex) => {
        if (config.options && config.options.length > 0) {
          const preselectedIndex = config.options.findIndex(
            opt => opt.isSelected
          );
          if (preselectedIndex !== -1) {
            initial[configIndex] = {
              optionIndex: preselectedIndex,
              option: {
                name: config.options[preselectedIndex].name,
                price: config.options[preselectedIndex].price,
              },
            };
          }
        }
      });
    }
    return initial;
  });

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      // Reset to default selections when dialog closes
      const initial: {
        [configIndex: number]: {
          optionIndex: number;
          option: { name: string; price: number };
        };
      } = {};
      if (product.productConfigurations && product.productConfigurations.length > 0) {
        product.productConfigurations.forEach((config, configIndex) => {
          if (config.options && config.options.length > 0) {
            const preselectedIndex = config.options.findIndex(
              opt => opt.isSelected
            );
            if (preselectedIndex !== -1) {
              initial[configIndex] = {
                optionIndex: preselectedIndex,
                option: {
                  name: config.options[preselectedIndex].name,
                  price: config.options[preselectedIndex].price,
                },
              };
            }
          }
        });
      }
      setSelectedConfigurations(initial);
      setSelectedOption(null);
      setCustomNotes({});
    }
  }, [open, product.productConfigurations]);

  // Handle configuration change
  const handleConfigurationChange = useCallback(
    (
      configIndex: number,
      optionIndex: number,
      option: { name: string; price: number }
    ) => {
      setSelectedConfigurations(prev => ({
        ...prev,
        [configIndex]: {
          optionIndex,
          option,
        },
      }));
    },
    []
  );

  // Get sum of all selected configuration option prices (for fixed prices)
  // Also calculate percentage adjustments
  const getSelectedConfigurationPrice = useCallback(() => {
    if (!product.productConfigurations || product.productConfigurations.length === 0) {
      return { fixedPrice: 0, percentageAdjustments: [] };
    }

    const selectedConfigEntries = Object.values(selectedConfigurations);
    if (selectedConfigEntries.length === 0) {
      return { fixedPrice: 0, percentageAdjustments: [] };
    }

    let fixedPrice = 0;
    const percentageAdjustments = [];

    // Process all selected options
    for (const { option } of selectedConfigEntries) {
      if (option) {
        if (option.priceType === 'percentage') {
          // Store percentage adjustment for later calculation
          percentageAdjustments.push({
            percentage: option.percentage || 0,
            isIncrease: option.isPercentageIncrease !== false,
          });
        } else {
          // Fixed price - add to sum
          if (option.price !== undefined && option.price !== null) {
            const configPrice = Number(option.price);
            if (configPrice > 0) {
              fixedPrice += configPrice;
            }
          }
        }
      }
    }

    return { fixedPrice, percentageAdjustments };
  }, [product.productConfigurations, selectedConfigurations]);

  // Calculate price with percentage adjustments
  const applyPercentageAdjustments = useCallback((basePrice: number, percentageAdjustments: Array<{ percentage: number; isIncrease: boolean }>) => {
    let adjustedPrice = basePrice;

    percentageAdjustments.forEach((adjustment) => {
      const percentage = adjustment.percentage || 0;
      if (adjustment.isIncrease) {
        adjustedPrice = adjustedPrice * (1 + percentage / 100);
      } else {
        adjustedPrice = adjustedPrice * (1 - percentage / 100);
      }
    });

    return adjustedPrice;
  }, []);

  // Calculate final price
  const calculateFinalPrice = useCallback(() => {
    // Get base price (original price, not discounted)
    let basePrice = Number(product.finalPriceDiscount || product.price);

    // Get configuration prices and percentage adjustments
    const configResult = getSelectedConfigurationPrice();
    const configFixedPrice = configResult.fixedPrice || 0;
    const percentageAdjustments = configResult.percentageAdjustments || [];

    // If configuration has fixed price, use it instead of base price
    if (configFixedPrice > 0) {
      basePrice = configFixedPrice;
    }

    // Apply coupon discount to base price FIRST (if coupon is active)
    let discountedBasePrice = basePrice;
    if (hasCoupon && couponPercentage) {
      discountedBasePrice = basePrice * (1 - couponPercentage / 100);
    }

    // Apply percentage adjustments to the discounted base price
    let adjustedPrice = applyPercentageAdjustments(discountedBasePrice, percentageAdjustments);

    // THEN add option price to the already discounted and adjusted base price
    // No discount is applied to options - they're added at full price
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const finalPrice = adjustedPrice + optionPrice;

    return finalPrice.toFixed(2);
  }, [getSelectedConfigurationPrice, applyPercentageAdjustments, selectedOption, product.finalPriceDiscount, product.price, hasCoupon, couponPercentage]);

  // Calculate marked up price (strikethrough) - original price before discount
  const calculateMarkedUpPrice = useCallback(() => {
    // Get base price (original price, not discounted)
    let basePrice = Number(product.finalPriceDiscount || product.price);

    // Get configuration prices and percentage adjustments
    const configResult = getSelectedConfigurationPrice();
    const configFixedPrice = configResult.fixedPrice || 0;
    const percentageAdjustments = configResult.percentageAdjustments || [];

    // If configuration has fixed price, use it instead of base price
    if (configFixedPrice > 0) {
      basePrice = configFixedPrice;
    }

    // Apply percentage adjustments to base price (before coupon)
    let adjustedPrice = applyPercentageAdjustments(Number(basePrice), percentageAdjustments);

    // Add option price to the adjusted base price (no discount)
    // The marked price shows the original price before discount is applied
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const markedPrice = adjustedPrice + optionPrice;

    return markedPrice.toFixed(2);
  }, [getSelectedConfigurationPrice, applyPercentageAdjustments, selectedOption, product.finalPriceDiscount, product.price]);

  // Helper function to compare configurations
  const configurationsChanged = useCallback(
    (existingConfigs: any, currentConfigs: any) => {
      if (!existingConfigs && !currentConfigs) return false;
      if (!existingConfigs || !currentConfigs) return true;

      const normalizeConfig = (configs: any) => {
        if (!configs) return {};
        return Object.keys(configs).reduce((acc: any, key: string) => {
          const config = configs[key];
          if (config && config.option) {
            acc[key] = {
              optionIndex: config.optionIndex,
              optionName: config.option?.name,
              optionPrice: config.option?.price,
            };
          }
          return acc;
        }, {});
      };

      const normalizedExisting = normalizeConfig(existingConfigs);
      const normalizedCurrent = normalizeConfig(currentConfigs);

      return JSON.stringify(normalizedExisting) !== JSON.stringify(normalizedCurrent);
    },
    []
  );

  // Handle add to cart
  const handleAddToCartClick = useCallback(() => {
    // Check if product has options but none are selected
    if (product.options && product.options.length > 0 && !selectedOption) {
      notifyError(
        'Please select an option before adding the product to your cart.'
      );
      return;
    }

    // Check if product already exists in cart
    const existingProduct = cart_products.find(
      (item: any) => item._id === product._id
    );

    // Check if option has changed
    const optionChanged =
      existingProduct &&
      JSON.stringify(existingProduct.selectedOption) !==
      JSON.stringify(selectedOption);

    // Check if configuration has changed
    const configurationChanged =
      existingProduct &&
      configurationsChanged(
        existingProduct.selectedConfigurations,
        selectedConfigurations
      );

    const productChanged = optionChanged || configurationChanged;
    const currentQty = existingProduct ? existingProduct.orderQuantity : 0;

    // Determine final quantity
    let finalQuantity;
    if (configurationChanged) {
      finalQuantity = orderQuantity;
    } else if (optionChanged) {
      finalQuantity = currentQty;
    } else {
      finalQuantity = currentQty + orderQuantity;
    }

    // Check quantity limits
    if (product.quantity && finalQuantity > product.quantity) {
      notifyError(
        `Sorry, only ${product.quantity} items available. ${existingProduct ? `You already have ${currentQty} in your cart.` : ''
        }`
      );
      return;
    }

    // Calculate prices
    const originalProductPrice = Number(product.price || 0);
    const markedUpPrice = product.updatedPrice || originalProductPrice;

    // Calculate base price - sum all selected configuration option prices
    // Get base price (original price, not discounted)
    let basePrice = Number(product.finalPriceDiscount || originalProductPrice);

    // Get configuration prices and percentage adjustments
    const configResult = getSelectedConfigurationPrice();
    const configFixedPrice = configResult.fixedPrice || 0;
    const percentageAdjustments = configResult.percentageAdjustments || [];

    // If configuration has fixed price, use it instead of base price
    if (configFixedPrice > 0) {
      basePrice = configFixedPrice;
    }

    // Apply coupon discount to base price FIRST (if coupon is active)
    let discountedBasePrice = basePrice;
    if (hasCoupon && couponPercentage) {
      discountedBasePrice = basePrice * (1 - couponPercentage / 100);
    }

    // Apply percentage adjustments to the discounted base price
    let adjustedPrice = applyPercentageAdjustments(discountedBasePrice, percentageAdjustments);

    // THEN add product option price to the already discounted and adjusted base price
    // No discount is applied to options - they're added at full price
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const finalPrice = adjustedPrice + optionPrice;

    // Determine the product image to use (option image if available, otherwise original)
    let productImage = product.img;
    if (selectedConfigurations && Object.keys(selectedConfigurations).length > 0) {
      // Find the first selected option with an image (prioritize last selected)
      const configIndices = Object.keys(selectedConfigurations);
      for (let i = configIndices.length - 1; i >= 0; i--) {
        const configIndex = parseInt(configIndices[i]);
        const selectedConfig = selectedConfigurations[configIndex];
        if (selectedConfig && selectedConfig.option && selectedConfig.option.image) {
          productImage = selectedConfig.option.image;
          break;
        }
      }
    }

    // Create properly formatted productConfigurations array
    let updatedProductConfigurations = undefined;
    if (product.productConfigurations && product.productConfigurations.length > 0) {
      updatedProductConfigurations = product.productConfigurations.map(
        (config: any, configIndex: number) => {
          // If custom note is enabled, include the custom note value in the config
          if (config.enableCustomNote) {
            const customNoteValue = customNotes && customNotes[configIndex] && typeof customNotes[configIndex] === 'string' && customNotes[configIndex].trim() !== ''
              ? customNotes[configIndex].trim()
              : undefined;

            return {
              ...config,
              ...(customNoteValue && { customNoteValue }),
            };
          }
          // Otherwise, handle selected configurations
          const selectedConfig = selectedConfigurations[configIndex];
          if (selectedConfig) {
            return {
              ...config,
              options: config.options.map((option: any, optionIndex: number) => {
                const isSelected = optionIndex === selectedConfig.optionIndex;
                // Preserve all option properties including priceType, percentage, isPercentageIncrease, and image
                return {
                  ...option,
                  // Set isSelected to true only for the user-selected option
                  isSelected,
                  // Preserve the selected option's image, priceType, percentage, and isPercentageIncrease if they exist
                  ...(isSelected && selectedConfig.option && {
                    ...(selectedConfig.option.image && { image: selectedConfig.option.image }),
                    ...(selectedConfig.option.priceType && { priceType: selectedConfig.option.priceType }),
                    ...(selectedConfig.option.percentage !== undefined && { percentage: selectedConfig.option.percentage }),
                    ...(selectedConfig.option.isPercentageIncrease !== undefined && { isPercentageIncrease: selectedConfig.option.isPercentageIncrease }),
                  }),
                };
              }),
            };
          }
          return config;
        }
      );
    }

    const computedCustomNotes = (() => {
      // Check if there are any configurations with enableCustomNote
      const hasCustomNoteConfigs = product.productConfigurations && product.productConfigurations.some((config: any) => config.enableCustomNote);
      if (!hasCustomNoteConfigs) return undefined;

      // If no customNotes object, return undefined
      if (!customNotes || typeof customNotes !== 'object' || Array.isArray(customNotes)) {
        return undefined;
      }

      // Filter and trim all non-empty values
      const filteredNotes: { [key: number]: string } = {};
      for (const key in customNotes) {
        if (Object.prototype.hasOwnProperty.call(customNotes, key)) {
          const note = customNotes[key];
          // Check if note is a non-empty string
          if (note !== null && note !== undefined && typeof note === 'string' && note.trim() !== '') {
            filteredNotes[Number(key)] = note.trim();
          }
        }
      }

      // Return filtered notes only if there are any non-empty values
      return Object.keys(filteredNotes).length > 0 ? filteredNotes : undefined;
    })();

    const productToAdd = {
      ...product,
      // Update product image if option image is selected
      img: productImage || product.img || product.imageURLs?.[0] || '',
      finalPriceDiscount: finalPrice,
      updatedPrice: markedUpPrice,
      selectedOption,
      basePrice: basePrice,
      orderQuantity: orderQuantity,
      productConfigurations:
        updatedProductConfigurations || product.productConfigurations,
      selectedConfigurations:
        Object.keys(selectedConfigurations).length > 0
          ? selectedConfigurations
          : undefined,
      customNotes: computedCustomNotes,
      options: selectedOption ? [selectedOption] : [],
    };

    dispatch(add_cart_product(productToAdd));

    if (productChanged) {
      dispatch(initialOrderQuantity());
    }

    // Close dialog
    onOpenChange(false);
  }, [
    product,
    selectedOption,
    selectedConfigurations,
    cart_products,
    orderQuantity,
    getSelectedConfigurationPrice,
    configurationsChanged,
    customNotes,
    dispatch,
    onOpenChange,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Configure {product.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Configurations */}
          {product.productConfigurations &&
            product.productConfigurations.length > 0 && (
              <div className="space-y-6">
                {/* Render configurations with options (when custom note is disabled) */}
                <ProductConfigurations
                  configurations={product.productConfigurations.filter(
                    (config: any) => !config.enableCustomNote
                  )}
                  onConfigurationChange={handleConfigurationChange}
                />
                {/* Custom Note Fields (when custom note is enabled) */}
                {product.productConfigurations.map((config: any, configIndex: number) => {
                  if (!config.enableCustomNote) return null;
                  return (
                    <div key={`custom-note-${configIndex}`} className="space-y-2">
                      <Label htmlFor={`custom-note-${configIndex}`} className="text-sm font-medium">
                        {config.title}
                      </Label>
                      <Textarea
                        id={`custom-note-${configIndex}`}
                        placeholder={config.customNotePlaceholder || 'Specify Rod Ends preference (All left, All right, mixed, or custom).'}
                        value={customNotes[configIndex] || ''}
                        onChange={(e) =>
                          setCustomNotes((prev) => ({
                            ...prev,
                            [configIndex]: e.target.value,
                          }))
                        }
                        className="min-h-[100px] resize-y"
                        rows={3}
                      />
                    </div>
                  );
                })}
              </div>
            )}

          {/* Product Options (if any) */}
          {product.options && product.options.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                Product Options
              </h3>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={
                  selectedOption
                    ? product.options.indexOf(selectedOption).toString()
                    : ''
                }
                onChange={e => {
                  const optionIndex = e.target.value;
                  if (optionIndex === '') {
                    setSelectedOption(null);
                  } else if (product.options && product.options.length > 0) {
                    setSelectedOption(product.options[parseInt(optionIndex)]);
                  }
                }}
              >
                <option value="">Select an option...</option>
                {product.options.map((option, index) => (
                  <option key={index} value={index.toString()}>
                    {option.title}
                    {option.price && Number(option.price) !== 0
                      ? ` (+$${Number(option.price).toFixed(2)})`
                      : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Separator />

          {/* Price Display */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg text-muted-foreground line-through">
                  ${calculateMarkedUpPrice()}
                </span>
                <span className="text-2xl font-bold text-primary">
                  ${calculateFinalPrice()}
                </span>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleAddToCartClick}
            disabled={product.status === 'out-of-stock'}
          >
            {product.status === 'out-of-stock'
              ? 'Out of Stock'
              : 'Add to Cart'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

