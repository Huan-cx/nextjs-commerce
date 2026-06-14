'use client';

import {cn, Divider, User} from '@heroui/react';

export interface B2BItem {
  id?: number | string;
  skuId?: number;
  spuId?: number;
  spuName: string;
  skuName?: string;
  skuCode?: string; // SKU编号/编码
  picUrl?: string;
  count: number;
  unitPrice?: number;
  totalPrice?: number;
  expectedPrice?: number;
  // ========== SKU 扩展字段 ==========
  barCode?: string; // 条形码
  minQty?: number; // 最小起订量
  unit?: string; // 单位
  weight?: number; // 重量，单位：kg
  hsCode?: string; // 海关编码
  packagingWay?: string; // 包装方式
  pcsPerCtn?: number; // 每箱数量(PC/CTN)
  nwPerCtn?: number; // 净重/箱，单位：kg
  gwPerCtn?: number; // 毛重/箱，单位：kg
}

export interface B2BItemListProps {
  items: B2BItem[];
  title?: string;
  showPrice?: boolean;
  showQuantity?: boolean;
  compact?: boolean;
  className?: string;
  priceFormatter?: (price: number) => string;
}

const defaultPriceFormatter = (price: number): string => {
  return price.toLocaleString();
};

/**
 * B2B 统一商品列表展示组件
 *
 * 适用于：询价单、报价单、订单确认
 *
 * @example
 * ```tsx
 * <B2BItemList
 *   title="Selected Items"
 *   items={items}
 *   showPrice={true}
 *   priceFormatter={fenToYuan}
 * />
 * ```
 */
export const B2BItemList = ({
                              items,
                              title,
                              showPrice = true,
                              showQuantity = true,
                              compact = false,
                              className,
                              priceFormatter = defaultPriceFormatter,
                            }: B2BItemListProps) => {
  if (!items || items.length === 0) {
    return (
        <div className={cn('text-center py-6 text-default-400', className)}>
          No items
        </div>
    );
  }

  return (
      <div className={className}>
        {title && (
            <h3
                className={cn(
                    'font-semibold mb-4 text-default-800',
                    compact ? 'text-base' : 'text-lg'
                )}
            >
              {title}
            </h3>
        )}

        <div className={compact ? 'space-y-2' : 'space-y-3'}>
          {items.map((item, index) => (
              <div key={item.id || index}>
                {index > 0 && !compact && <Divider className="my-3"/>}
                <User
                    avatarProps={{
                      src: item.picUrl,
                      size: compact ? 'sm' : 'md',
                      radius: 'md',
                      className: 'flex-shrink-0',
                    }}
                    name={
                      <span
                          className={cn(
                              'font-bold text-default-800 line-clamp-1',
                              compact ? 'text-sm' : 'text-base'
                          )}
                      >
                  {item.spuName}
                </span>
                    }
                    description={
                      <div className="space-y-0.5">
                        {item.skuName && (
                            <p
                                className={cn(
                                    'text-default-500',
                                    compact ? 'text-xs' : 'text-tiny'
                                )}
                            >
                              {item.skuName}
                            </p>
                        )}

                        {showQuantity && showPrice && item.unitPrice !== undefined && (
                            <p
                                className={cn(
                                    'font-medium text-default-800',
                                    compact ? 'text-xs' : 'text-tiny'
                                )}
                            >
                              Quantity: {item.count} × {priceFormatter(item.unitPrice)} ={' '}
                              {item.totalPrice !== undefined
                                  ? priceFormatter(item.totalPrice)
                                  : '-'}
                            </p>
                        )}

                        {showQuantity && (!showPrice || item.unitPrice === undefined) && (
                            <p
                                className={cn(
                                    'font-medium text-default-800',
                                    compact ? 'text-xs' : 'text-tiny'
                                )}
                            >
                              Quantity: {item.count}
                            </p>
                        )}

                        {!showQuantity && showPrice && item.expectedPrice !== undefined && (
                            <p
                                className={cn(
                                    'font-medium text-default-800',
                                    compact ? 'text-xs' : 'text-tiny'
                                )}
                            >
                              Expected: {priceFormatter(item.expectedPrice)}
                            </p>
                        )}
                      </div>
                    }
                />
              </div>
          ))}
        </div>
      </div>
  );
};
