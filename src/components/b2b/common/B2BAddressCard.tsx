'use client';

import {Card, CardBody, cn} from '@heroui/react';
import {AddressLine} from '@/types/api/address/type';
import {formatAddressLines} from '@/utils/b2b/addressMapper';

export interface B2BAddressCardProps {
  title: string;
  address: AddressLine | null;
  isSelected?: boolean;
  isSelectable?: boolean;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

/**
 * B2B 统一地址卡片组件
 *
 * @example
 * ```tsx
 * <B2BAddressCard
 *   title="Billing Address"
 *   address={address}
 *   isSelectable={true}
 *   isSelected={selectedId === address.id}
 *   onClick={() => handleSelect(address)}
 * />
 * ```
 */
export const B2BAddressCard = ({
                                 title,
                                 address,
                                 isSelected = false,
                                 isSelectable = false,
                                 onClick,
                                 compact = false,
                                 className,
                               }: B2BAddressCardProps) => {
  const lines = formatAddressLines(address);
  const [name, ...restLines] = lines;

  const cardContent = (
      <CardBody className={cn(compact ? 'p-3' : 'p-4')}>
        <p
            className={cn(
                'font-semibold text-default-800 mb-1',
                compact ? 'text-sm' : 'text-base'
            )}
        >
          {name || title}
        </p>
        <div className="space-y-0.5">
          {restLines.map((line, index) => (
              <p
                  key={index}
                  className={cn(
                      'text-default-500',
                      compact ? 'text-xs' : 'text-sm'
                  )}
              >
                {line}
              </p>
          ))}
        </div>
      </CardBody>
  );

  if (isSelectable) {
    return (
        <Card
            isPressable
            isHoverable
            className={cn(
                'transition-all duration-200',
                isSelected
                    ? 'border-2 border-primary bg-primary-50 shadow-md'
                    : 'border border-default-200 hover:border-primary-300 hover:shadow-sm',
                className
            )}
            onClick={onClick}
        >
          {cardContent}
        </Card>
    );
  }

  return (
      <Card className={cn('border border-default-200', className)}>
        {cardContent}
      </Card>
  );
};
