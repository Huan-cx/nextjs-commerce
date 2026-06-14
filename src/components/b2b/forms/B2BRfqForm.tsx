'use client';

import {useForm} from 'react-hook-form';
import {Input, Select, SelectItem, Textarea,} from '@heroui/react';
import {RfqFormData} from '@/types/b2b/flow.types';
import {
  CURRENCY_OPTIONS,
  DELIVERY_TYPE_OPTIONS,
  INCOTERM_OPTIONS,
  PRICE_UNIT_OPTIONS,
} from '@/utils/b2b/validationRules';
import {useTranslations} from 'next-intl';

export interface B2BRfqFormProps {
  initialValues?: Partial<RfqFormData>;
  onSubmit: (data: RfqFormData) => void;
  className?: string;
}

/**
 * B2B 询价单表单组件（包含国际贸易信息）
 *
 * 字段：
 * - 联系人信息
 * - 国际贸易术语 (Incoterms)
 * - 目的地 / 交付港口
 * - 期望交货期
 * - 目标价格（币种 + 金额 + 单位）
 * - 需求说明
 */
export const B2BRfqForm = ({
                             initialValues,
                             onSubmit,
                             className,
                           }: B2BRfqFormProps) => {
  const t = useTranslations('b2b.createRfq');

  const expectedDeliveryType = watch('expectedDeliveryType');

  const {
    register,
    watch,
    formState: {errors},
  } = useForm<RfqFormData>({
    defaultValues: {
      contactName: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      postalCode: '',
      incoterms: '',
      deliveryPort: '',
      expectedDeliveryType: '',
      expectedDeliveryDate: '',
      targetCurrency: '',
      targetPrice: undefined,
      targetPriceUnit: '',
      requirement: '',
      ...initialValues,
    },
    mode: 'onTouched',
  });

  // 表单提交由外部 Wizard 控制，这里只渲染字段
  return (
      <div className={className}>
        {/* 联系人信息 */}
        <div className="space-y-4 mb-6">
          <h4 className="font-semibold text-base text-default-800">
            {t('contactInfo')}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
                label={t('contactName')}
                placeholder={t('contactNamePlaceholder')}
                isInvalid={!!errors.contactName}
                errorMessage={errors.contactName?.message?.toString()}
                {...register('contactName', {
                  required: t('contactNameRequired'),
                  minLength: {value: 2, message: 'Minimum 2 characters'},
                })}
            />
            <Input
                label={t('email')}
                placeholder={t('emailPlaceholder')}
                type="email"
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message?.toString()}
                {...register('email', {
                  required: t('emailRequired'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('emailInvalid'),
                  },
                })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
                label={t('country')}
                placeholder={t('countryPlaceholder')}
                {...register('country')}
            />
            <Input
                label={t('city')}
                placeholder={t('cityPlaceholder')}
                {...register('city')}
            />
          </div>
        </div>

        {/* 国际贸易信息 */}
        <div className="space-y-4 mb-6">
          <h4 className="font-semibold text-base text-default-800">
            {t('shippingInfo')}
          </h4>

          <Select
              label={t('incoterms')}
              placeholder={t('incotermsPlaceholder')}
              isInvalid={!!errors.incoterms}
              errorMessage={errors.incoterms?.message?.toString()}
              {...register('incoterms', {
                required: t('incotermsRequired'),
              })}
          >
            {INCOTERM_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} textValue={t(`incotermsOptions.${opt.value}`, {default: opt.label})}>
                  {t(`incotermsOptions.${opt.value}`, {default: opt.label})}
                </SelectItem>
            ))}
          </Select>

          <Input
              label={t('deliveryPort')}
              placeholder={t('deliveryPortPlaceholder')}
              isInvalid={!!errors.deliveryPort}
              errorMessage={errors.deliveryPort?.message?.toString()}
              {...register('deliveryPort', {
                required: t('deliveryPortRequired'),
              })}
          />

          <Select
              label={t('expectedDeliveryType')}
              placeholder={t('expectedDeliveryTypePlaceholder')}
              {...register('expectedDeliveryType')}
          >
            {DELIVERY_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value}
                            textValue={t(`expectedDeliveryTypeOptions.${opt.value}`, {default: opt.label})}>
                  {t(`expectedDeliveryTypeOptions.${opt.value}`, {default: opt.label})}
                </SelectItem>
            ))}
          </Select>

          {expectedDeliveryType === 'CUSTOM_DATE' && (
              <Input
                  label={t('expectedDeliveryDate')}
                  type="date"
                  {...register('expectedDeliveryDate')}
              />
          )}
        </div>

        {/* 目标价格信息 */}
        <div className="space-y-4 mb-6">
          <h4 className="font-semibold text-base text-default-800">
            {t('pricingInfo')}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
                label={t('targetCurrency')}
                placeholder={t('targetCurrencyPlaceholder')}
                {...register('targetCurrency')}
            >
              {CURRENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} textValue={t(`targetCurrencyOptions.${opt.value}`, {default: opt.label})}>
                    {t(`targetCurrencyOptions.${opt.value}`, {default: opt.label})}
                  </SelectItem>
              ))}
            </Select>
            <Input
                label={t('targetPrice')}
                placeholder={t('targetPricePlaceholder')}
                type="number"
                {...register('targetPrice', {valueAsNumber: true})}
            />
            <Select
                label={t('targetPriceUnit')}
                placeholder={t('targetPriceUnitPlaceholder')}
                {...register('targetPriceUnit')}
            >
              {PRICE_UNIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value}
                              textValue={t(`targetPriceUnitOptions.${opt.value}`, {default: opt.label})}>
                    {t(`targetPriceUnitOptions.${opt.value}`, {default: opt.label})}
                  </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        {/* 需求说明 */}
        <div className="space-y-4">
          <h4 className="font-semibold text-base text-default-800">
            {t('requirements')}
          </h4>
          <Textarea
              label={t('requirement')}
              placeholder={t('requirementPlaceholder')}
              {...register('requirement')}
              minRows={3}
          />
        </div>
      </div>
  );
};
