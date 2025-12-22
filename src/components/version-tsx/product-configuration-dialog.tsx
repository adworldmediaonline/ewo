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
import ProductConfigurations from '@/components/version-tsx/product-details/product-configurations';
import {
  add_cart_product,
  initialOrderQuantity,
} from '@/redux/features/cartSlice';
import { notifyError } from '@/utils/toast';
import type { Product } from '@/components/version-tsx/product-card';

interface ProductConfigurationDialogProps {
  product: Product & {
    productConfigurations?: Array<{
      title: string;
      options: Array<{
        name: string;
        price: number;
        isSelected: boolean;
      }>;
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
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [selectedConfigurations, setSelectedConfigurations] = useState<{
    [configIndex: number]: {
      optionIndex: number;
      option: {
        name: string;
        price: number;
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

  // Get selected configuration price (replaces base price, not adds to it)
  const getSelectedConfigurationPrice = useCallback(() => {
    if (!product.productConfigurations || product.productConfigurations.length === 0) {
      return null;
    }

    const selectedConfigEntries = Object.values(selectedConfigurations);
    if (selectedConfigEntries.length === 0) {
      return null;
    }

    for (const { option } of selectedConfigEntries) {
      if (option && option.price !== undefined && option.price !== null) {
        const configPrice = Number(option.price);
        if (configPrice > 0) {
          return configPrice;
        }
      }
    }

    return null;
  }, [product.productConfigurations, selectedConfigurations]);

  // Calculate final price
  const calculateFinalPrice = useCallback(() => {
    const configPrice = getSelectedConfigurationPrice();
    if (configPrice !== null) {
      const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
      return (configPrice + optionPrice).toFixed(2);
    }

    const baseFinalPrice = product.finalPriceDiscount || product.price;
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    return (Number(baseFinalPrice) + optionPrice).toFixed(2);
  }, [getSelectedConfigurationPrice, selectedOption, product.finalPriceDiscount, product.price]);

  // Calculate marked up price
  const calculateMarkedUpPrice = useCallback(() => {
    const baseMarkedUpPrice = product.updatedPrice || product.price;
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    return (Number(baseMarkedUpPrice) + optionPrice).toFixed(2);
  }, [selectedOption, product.updatedPrice, product.price]);

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
        `Sorry, only ${product.quantity} items available. ${
          existingProduct ? `You already have ${currentQty} in your cart.` : ''
        }`
      );
      return;
    }

    // Calculate prices
    const originalProductPrice = Number(product.price || 0);
    const markedUpPrice = product.updatedPrice || originalProductPrice;

    // Determine base price
    let basePrice = originalProductPrice;
    if (
      product.productConfigurations &&
      product.productConfigurations.length > 0 &&
      Object.keys(selectedConfigurations).length > 0
    ) {
      const configPrice = getSelectedConfigurationPrice();
      if (configPrice !== null && configPrice > 0) {
        basePrice = configPrice;
      }
    } else {
      basePrice = Number(product.finalPriceDiscount || originalProductPrice);
    }

    // Add option price
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const finalPrice = basePrice + optionPrice;

    // Create properly formatted productConfigurations array
    let updatedProductConfigurations = undefined;
    if (
      product.productConfigurations &&
      product.productConfigurations.length > 0 &&
      Object.keys(selectedConfigurations).length > 0
    ) {
      updatedProductConfigurations = product.productConfigurations.map(
        (config, configIndex) => {
          const selectedConfig = selectedConfigurations[configIndex];
          if (selectedConfig) {
            return {
              ...config,
              options: config.options.map((option, optionIndex) => ({
                ...option,
                isSelected: optionIndex === selectedConfig.optionIndex,
              })),
            };
          }
          return config;
        }
      );
    }

    const productToAdd = {
      ...product,
      img: product.img || product.imageURLs?.[0] || '',
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
              <div>
                <ProductConfigurations
                  configurations={product.productConfigurations}
                  onConfigurationChange={handleConfigurationChange}
                />
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

