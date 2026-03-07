'use client';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { isOptionOutOfStock } from '@/lib/product-stock';

interface ConfigurationOption {
  name: string;
  price: number;
  priceType?: 'fixed' | 'percentage';
  percentage?: number;
  isPercentageIncrease?: boolean;
  isSelected: boolean;
  image?: string;
  quantity?: number | null;
}

interface ProductConfiguration {
  title: string;
  options: ConfigurationOption[];
  enableCustomNote?: boolean;
  customNotePlaceholder?: string;
}

interface ProductConfigurationsProps {
  configurations: ProductConfiguration[];
  onConfigurationChange?: (
    configIndex: number,
    optionIndex: number,
    option: ConfigurationOption
  ) => void;
}

export default function ProductConfigurations({
  configurations,
  onConfigurationChange,
}: ProductConfigurationsProps) {
  const [selectedOptions, setSelectedOptions] = useState<{
    [configIndex: number]: number;
  }>(() => {
    // Initialize with preselected options (skip out-of-stock)
    const initial: { [configIndex: number]: number } = {};
    configurations.forEach((config, configIndex) => {
      const preselectedIndex = config.options.findIndex(
        opt => opt.isSelected && !isOptionOutOfStock(opt)
      );
      if (preselectedIndex !== -1) {
        initial[configIndex] = preselectedIndex;
      }
    });
    return initial;
  });

  const handleOptionSelect = (
    configIndex: number,
    optionIndex: number,
    option: ConfigurationOption
  ) => {
    if (isOptionOutOfStock(option)) return;

    setSelectedOptions(prev => ({
      ...prev,
      [configIndex]: optionIndex,
    }));

    // Call parent callback if provided
    if (onConfigurationChange) {
      onConfigurationChange(configIndex, optionIndex, option);
    }
  };

  // Notify parent about preselected configurations on mount
  useEffect(() => {
    if (onConfigurationChange && configurations && configurations.length > 0) {
      configurations.forEach((config, configIndex) => {
        if (config.options && config.options.length > 0) {
          const preselectedIndex = config.options.findIndex(
            opt => opt.isSelected
          );
          if (preselectedIndex !== -1) {
            onConfigurationChange(
              configIndex,
              preselectedIndex,
              config.options[preselectedIndex]
            );
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  if (!configurations || configurations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {configurations.map((config, configIndex) => {
        // Skip rendering if custom note is enabled (options won't be shown)
        if (config.enableCustomNote) {
          return null;
        }

        // Skip if no options available
        if (!config.options || config.options.length === 0) {
          return null;
        }

        const selectedIndex = selectedOptions[configIndex] ?? -1;

        return (
          <div key={configIndex} className="space-y-3">
            {/* Configuration Title */}
            <h3 className="text-base font-semibold text-foreground">
              {config.title}
            </h3>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.options.map((option, optionIndex) => {
                const isSelected = selectedIndex === optionIndex;
                const hasPrice = option.price && Number(option.price) > 0;
                const outOfStock = isOptionOutOfStock(option);

                return (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() =>
                      !outOfStock && handleOptionSelect(configIndex, optionIndex, option)
                    }
                    disabled={outOfStock}
                    className={cn(
                      'relative px-4 py-3 rounded-lg border-2 transition-all duration-200 text-left',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                      outOfStock && 'opacity-60 cursor-not-allowed',
                      isSelected && !outOfStock
                        ? 'border-foreground bg-background font-semibold'
                        : !outOfStock
                          ? 'border-muted-foreground/30 bg-background hover:border-muted-foreground/50'
                          : 'border-muted-foreground/20 bg-muted/30'
                    )}
                    aria-pressed={isSelected}
                    aria-disabled={outOfStock}
                    aria-label={`Select ${option.name}${outOfStock ? ' (Out of Stock)' : hasPrice ? ` for $${Number(option.price).toFixed(2)}` : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isSelected && !outOfStock
                            ? 'text-foreground'
                            : outOfStock
                              ? 'text-muted-foreground'
                              : 'text-foreground/90'
                        )}
                      >
                        {option.name}
                      </span>
                      {outOfStock && (
                        <span className="text-xs font-medium text-destructive">
                          Out of Stock
                        </span>
                      )}
                      {/* {hasPrice && (
                        <span
                          className={cn(
                            'text-xs font-medium whitespace-nowrap',
                            isSelected
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          )}
                        >
                          ${Number(option.price).toFixed(2)}
                        </span>
                      )} */}
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="h-2 w-2 rounded-full bg-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

