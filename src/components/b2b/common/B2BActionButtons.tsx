'use client';

import {Button, cn} from '@heroui/react';

export interface B2BActionButtonsProps {
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  isPrimaryLoading?: boolean;
  isSecondaryLoading?: boolean;
  isPrimaryDisabled?: boolean;
  isSecondaryDisabled?: boolean;
  primaryColor?: 'primary' | 'success' | 'danger' | 'warning';
  secondaryVariant?: 'flat' | 'light' | 'bordered';
  showDivider?: boolean;
  className?: string;
}

/**
 * B2B 统一操作按钮组件
 *
 * @example
 * ```tsx
 * <B2BActionButtons
 *   primaryLabel="Submit"
 *   secondaryLabel="Cancel"
 *   onPrimary={handleSubmit}
 *   onSecondary={handleCancel}
 * />
 * ```
 */
export const B2BActionButtons = ({
                                   primaryLabel,
                                   secondaryLabel,
                                   onPrimary,
                                   onSecondary,
                                   isPrimaryLoading = false,
                                   isSecondaryLoading = false,
                                   isPrimaryDisabled = false,
                                   isSecondaryDisabled = false,
                                   primaryColor = 'primary',
                                   secondaryVariant = 'flat',
                                   showDivider = true,
                                   className,
                                 }: B2BActionButtonsProps) => {
  return (
      <div
          className={cn(
              'flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3',
              showDivider && 'pt-4 border-t border-default-200',
              className
          )}
      >
        <div className="flex-1">
          {secondaryLabel && onSecondary && (
              <Button
                  fullWidth
                  variant={secondaryVariant}
                  color="danger"
                  isLoading={isSecondaryLoading}
                  isDisabled={isSecondaryDisabled}
                  onPress={onSecondary}
              >
                {secondaryLabel}
              </Button>
          )}
        </div>
        <div className="flex-1">
          <Button
              fullWidth
              color={primaryColor}
              isLoading={isPrimaryLoading}
              isDisabled={isPrimaryDisabled}
              onPress={onPrimary}
          >
            {primaryLabel}
          </Button>
        </div>
      </div>
  );
};
