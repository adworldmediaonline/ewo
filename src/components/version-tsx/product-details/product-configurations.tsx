'use client';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ConfigurationOption {
  name: string;
  price: number;
  isSelected: boolean;
  image?: string;
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
    // Initialize with preselected options
    const initial: { [configIndex: number]: number } = {};
    configurations.forEach((config, configIndex) => {
      const preselectedIndex = config.options.findIndex(
        opt => opt.isSelected
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

                return (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() =>
                      handleOptionSelect(configIndex, optionIndex, option)
                    }
                    className={cn(
                      'relative px-4 py-3 rounded-lg border-2 transition-all duration-200 text-left',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                      isSelected
                        ? 'border-foreground bg-background font-semibold'
                        : 'border-muted-foreground/30 bg-background hover:border-muted-foreground/50'
                    )}
                    aria-pressed={isSelected}
                    aria-label={`Select ${option.name}${hasPrice ? ` for $${Number(option.price).toFixed(2)}` : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isSelected
                            ? 'text-foreground'
                            : 'text-foreground/90'
                        )}
                      >
                        {option.name}
                      </span>
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

