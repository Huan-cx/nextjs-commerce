'use client';

import {Card, CardBody, cn, Divider} from '@heroui/react';
import {PriceWrapper} from '@/components/theme/ui/Price';

export interface PriceItem {
  label: string;
  value: number;
  optional?: boolean;
  description?: string;
}

export interface B2BPriceSummaryProps {
  items: PriceItem[];
  totalPrice: number;
  currency?: string;
  title?: string;
  compact?: boolean;
  className?: string;
  priceFormatter?: (price: number) => string;
  forceShow?: boolean;
}

const defaultPriceFormatter = (price: number): string => {
  return price.toLocaleString();
};

/**
 * B2B 统一价格摘要组件
 *
 * 适用于：报价单详情、订单确认
 *
 * @example
 * ```tsx
 * <B2BPriceSummary
 *   title="Price Summary"
 *   items={[
 *     { label: 'Subtotal', value: 10000 },
 *     { label: 'Shipping', value: 500 },
 *   ]}
 *   totalPrice={10500}
 *   currency="USD"
 *   priceFormatter={fenToYuan}
 * />
 * ```
 */
export const B2BPriceSummary = ({
                                  items,
                                  totalPrice,
                                  currency,
                                  title,
                                  compact = false,
                                  className,
                                  priceFormatter = defaultPriceFormatter,
                                  forceShow = false,
                                }: B2BPriceSummaryProps) => {
  const content = (
      <PriceWrapper forceShow={forceShow}>
        <div className="space-y-2">
        {items.map((item, index) => (
            <div key={index} className="flex justify-between items-start">
              <div>
            <span
                className={cn(
                    'text-default-600',
                    compact ? 'text-sm' : 'text-base'
                )}
            >
              {item.label}
            </span>
                {item.description && (
                    <p className="text-xs text-default-400">{item.description}</p>
                )}
              </div>
              <span className={cn('text-right', compact ? 'text-sm' : 'text-base')}>
            {priceFormatter(item.value)}
          </span>
            </div>
        ))}

        <Divider className="my-2"/>

        <div className="flex justify-between items-center font-bold">
        <span className={cn('text-default-800', compact ? 'text-base' : 'text-lg')}>
          Total
        </span>
          <span className={cn('text-right', compact ? 'text-base' : 'text-lg')}>
          {currency && <span className="text-default-500 mr-1">{currency}</span>}
            {priceFormatter(totalPrice)}
        </span>
        </div>
        </div>
      </PriceWrapper>
  );

  if (compact) {
    return (
        <div className={cn('bg-default-50 rounded-lg p-4', className)}>
          {title && <h4 className="font-semibold mb-3">{title}</h4>}
          {content}
        </div>
    );
  }

  return (
      <Card className={className}>
        <CardBody className="space-y-3">
          {title && <h3 className="font-semibold text-lg">{title}</h3>}
          {content}
        </CardBody>
      </Card>
  );
};
