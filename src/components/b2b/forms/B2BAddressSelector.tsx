'use client';

import {Button, Checkbox, Divider} from '@heroui/react';
import {AddressLine} from '@/types/api/address/type';
import {B2BAddressCard} from '../common/B2BAddressCard';
import {useTranslations} from 'next-intl';

export interface B2BAddressSelectorProps {
  addresses: AddressLine[];
  selectedAddress: AddressLine | null;
  onSelect: (address: AddressLine | null) => void;
  onNewAddress?: () => void;
  title?: string;
  showNewButton?: boolean;
  showSameAsBillingOption?: boolean;
  sameAsBilling?: boolean;
  onSameAsBillingChange?: (value: boolean) => void;
  className?: string;
}

/**
 * B2B 统一地址选择器组件
 *
 * 功能：
 * - 显示已保存的地址列表
 * - 支持选择已有地址
 * - 提供"新建地址"入口
 * - 支持"与账单地址相同"选项
 */
export const B2BAddressSelector = ({
                                     addresses,
                                     selectedAddress,
                                     onSelect,
                                     onNewAddress,
                                     title,
                                     showNewButton = true,
                                     showSameAsBillingOption = false,
                                     sameAsBilling = false,
                                     onSameAsBillingChange,
                                     className,
                                   }: B2BAddressSelectorProps) => {
  const t = useTranslations('b2b');

  return (
      <div className={className}>
        {title && (
            <h3 className="font-semibold text-lg text-default-800 mb-4">{title}</h3>
        )}

        {/* 与账单地址相同选项 */}
        {showSameAsBillingOption && onSameAsBillingChange && (
            <>
              <div className="mb-4">
                <Checkbox
                    isSelected={sameAsBilling}
                    onValueChange={onSameAsBillingChange}
                >
                  {t('sameAsBillingAddress')}
                </Checkbox>
              </div>
              <Divider className="mb-4"/>
            </>
        )}

        {/* 已保存地址列表 */}
        {!sameAsBilling && addresses.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-default-500 mb-3">
                {t('selectFromSavedAddresses')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                {addresses.map((address) => (
                    <B2BAddressCard
                        key={address.id}
                        title=""
                        address={address}
                        isSelectable={true}
                        isSelected={selectedAddress?.id === address.id}
                        onClick={() => onSelect(address)}
                        compact={true}
                    />
                ))}
              </div>
            </div>
        )}

        {/* 新建地址按钮 */}
        {!sameAsBilling && showNewButton && onNewAddress && (
            <div>
              {addresses.length > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    <Divider className="flex-1"/>
                    <span className="text-sm text-default-400">{t('or')}</span>
                    <Divider className="flex-1"/>
                  </div>
              )}
              <Button
                  fullWidth
                  variant="bordered"
                  onPress={onNewAddress}
                  startContent={
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                      />
                    </svg>
                  }
              >
                {t('addNewAddress')}
              </Button>
            </div>
        )}

        {/* 无地址提示 */}
        {!sameAsBilling && addresses.length === 0 && (
            <div className="text-center py-6">
              <p className="text-default-400 text-sm mb-3">
                {t('noSavedAddresses')}
              </p>
              {showNewButton && onNewAddress && (
                  <Button color="primary" onPress={onNewAddress}>
                    {t('addNewAddress')}
                  </Button>
              )}
            </div>
        )}
      </div>
  );
};
