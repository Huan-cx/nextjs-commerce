'use client';

import {useForm} from 'react-hook-form';
import {Button, Input, Card, CardBody, Divider} from '@heroui/react';
import {AddressLine} from '@/types/api/address/type';
import {addressValidationRules} from '@/utils/b2b/validationRules';
import {useTranslations} from 'next-intl';
import {useEffect} from 'react';
import CountrySelect from '@/components/common/form/country';
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  User,
  Hash,
} from 'lucide-react';

export interface B2BAddressFormProps {
  initialValues?: Partial<AddressLine>;
  onSubmit: (data: AddressLine) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  showHeader?: boolean;
  compact?: boolean;
}

/**
 * B2B 统一地址表单组件
 *
 * 功能：
 * - 完整的地址字段（含公司信息、VAT、EORI）
 * - 实时表单验证
 * - 支持编辑模式（填充初始值）
 * - 分组布局，视觉层次清晰
 */
export const B2BAddressForm = ({
                                 initialValues,
                                 onSubmit,
                                 onCancel,
                                 isSubmitting = false,
                                 submitLabel,
                                 showHeader = true,
                                 compact = false,
                               }: B2BAddressFormProps) => {
  const t = useTranslations('b2b.address');

  const {
    register,
    handleSubmit,
    formState: {errors},
    reset,
    control,
  } = useForm<AddressLine>({
    defaultValues: initialValues || {
      firstName: '',
      lastName: '',
      companyName: '',
      address: '',
      street: '',
      country: '',
      state: '',
      city: '',
      postcode: '',
      phone: '',
      email: '',
      vat: '',
      eori: '',
    },
    mode: 'onTouched',
  });

  // 当 initialValues 变化时重置表单
  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const handleFormSubmit = (data: AddressLine) => {
    onSubmit(data);
  };

  const inputSize = compact ? 'md' : 'md';
  const iconSize = compact ? 16 : 18;

  return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* 头部 */}
        {showHeader && (
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <MapPin className="w-5 h-5 text-primary"/>
              </div>
              <div>
                <h3 className="font-semibold text-xl text-default-800">
                  {initialValues?.id ? t('editAddress') : t('addNewAddress')}
                </h3>
                <p className="text-sm text-default-500">
                  {initialValues?.id ? t('editAddressSubtitle') : t('addNewAddressSubtitle')}
                </p>
              </div>
            </div>
        )}

        {/* 个人信息 */}
        <Card className="border border-default-200 shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary"/>
              <h4 className="font-semibold text-default-800">{t('contactInformation')}</h4>
            </div>
            <Divider className="mb-4"/>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                  size={inputSize}
                  label={t('firstName')}
                  placeholder={t('firstNamePlaceholder')}
                  isInvalid={!!errors.firstName}
                  errorMessage={errors.firstName?.message?.toString()}
                  startContent={
                    <User className="text-default-400" size={iconSize}/>
                  }
                  classNames={{
                    label: 'text-sm font-medium',
                    input: 'text-base',
                    inputWrapper: '!rounded-[0.62rem]',
                  }}
                  {...register('firstName', addressValidationRules.firstName)}
              />
              <Input
                  size={inputSize}
                  label={t('lastName')}
                  placeholder={t('lastNamePlaceholder')}
                  isInvalid={!!errors.lastName}
                  errorMessage={errors.lastName?.message?.toString()}
                  startContent={
                    <User className="text-default-400" size={iconSize}/>
                  }
                  classNames={{
                    label: 'text-sm font-medium',
                    input: 'text-base',
                    inputWrapper: '!rounded-[0.62rem]',
                  }}
                  {...register('lastName', addressValidationRules.lastName)}
              />
            </div>
          </CardBody>
        </Card>

        {/* 公司信息 */}
        <Card className="border border-default-200 shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-primary"/>
              <h4 className="font-semibold text-default-800">{t('companyInformation')}</h4>
            </div>
            <Divider className="mb-4"/>

            <div className="space-y-4">
              <Input
                  size={inputSize}
                  label={t('companyName')}
                  placeholder={t('companyNamePlaceholder')}
                  startContent={
                    <Building2 className="text-default-400" size={iconSize}/>
                  }
                  classNames={{
                    label: 'text-sm font-medium',
                    input: 'text-base',
                    inputWrapper: '!rounded-[0.62rem]',
                  }}
                  {...register('companyName')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    size={inputSize}
                    label={t('vatNumber')}
                    placeholder={t('vatNumberPlaceholder')}
                    startContent={
                      <Hash className="text-default-400" size={iconSize}/>
                    }
                    classNames={{
                      label: 'text-sm font-medium',
                      input: 'text-base',
                      inputWrapper: '!rounded-[0.62rem]',
                    }}
                    {...register('vat')}
                />
                <Input
                    size={inputSize}
                    label={t('eoriNumber')}
                    placeholder={t('eoriNumberPlaceholder')}
                    startContent={
                      <Hash className="text-default-400" size={iconSize}/>
                    }
                    classNames={{
                      label: 'text-sm font-medium',
                      input: 'text-base',
                      inputWrapper: '!rounded-[0.62rem]',
                    }}
                    {...register('eori')}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 地址信息 */}
        <Card className="border border-default-200 shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary"/>
              <h4 className="font-semibold text-default-800">{t('addressInformation')}</h4>
            </div>
            <Divider className="mb-4"/>

            <div className="space-y-4">
              <Input
                  size={inputSize}
                  label={t('addressLine1')}
                  placeholder={t('addressLine1Placeholder')}
                  isInvalid={!!errors.address}
                  errorMessage={errors.address?.message?.toString()}
                  startContent={
                    <MapPin className="text-default-400" size={iconSize}/>
                  }
                  classNames={{
                    label: 'text-sm font-medium',
                    input: 'text-base',
                    inputWrapper: '!rounded-[0.62rem]',
                  }}
                  {...register('address', addressValidationRules.address)}
              />
              <Input
                  size={inputSize}
                  label={t('addressLine2')}
                  placeholder={t('addressLine2Placeholder')}
                  startContent={
                    <MapPin className="text-default-400" size={iconSize}/>
                  }
                  classNames={{
                    label: 'text-sm font-medium',
                    input: 'text-base',
                    inputWrapper: '!rounded-[0.62rem]',
                  }}
                  {...register('street')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CountrySelect
                    control={control}
                    name="country"
                    label={t('country')}
                    placeholder={t('countryPlaceholder')}
                    size={inputSize}
                    errorMsg={errors.country?.message?.toString()}
                    required={true}
                />
                <Input
                    size={inputSize}
                    label={t('stateProvince')}
                    placeholder={t('stateProvincePlaceholder')}
                    isInvalid={!!errors.state}
                    errorMessage={errors.state?.message?.toString()}
                    classNames={{
                      label: 'text-sm font-medium',
                      input: 'text-base',
                      inputWrapper: '!rounded-[0.62rem]',
                    }}
                    {...register('state')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    size={inputSize}
                    label={t('city')}
                    placeholder={t('cityPlaceholder')}
                    isInvalid={!!errors.city}
                    errorMessage={errors.city?.message?.toString()}
                    classNames={{
                      label: 'text-sm font-medium',
                      input: 'text-base',
                      inputWrapper: '!rounded-[0.62rem]',
                    }}
                    {...register('city', addressValidationRules.city)}
                />
                <Input
                    size={inputSize}
                    label={t('postalCode')}
                    placeholder={t('postalCodePlaceholder')}
                    isInvalid={!!errors.postcode}
                    errorMessage={errors.postcode?.message?.toString()}
                    startContent={
                      <Hash className="text-default-400" size={iconSize}/>
                    }
                    classNames={{
                      label: 'text-sm font-medium',
                      input: 'text-base',
                      inputWrapper: '!rounded-[0.62rem]',
                    }}
                    {...register('postcode', addressValidationRules.postcode)}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 联系方式 */}
        <Card className="border border-default-200 shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-primary"/>
              <h4 className="font-semibold text-default-800">{t('contactDetails')}</h4>
            </div>
            <Divider className="mb-4"/>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                  size={inputSize}
                  label={t('phoneNumber')}
                  placeholder={t('phoneNumberPlaceholder')}
                  type="tel"
                  isInvalid={!!errors.phone}
                  errorMessage={errors.phone?.message?.toString()}
                  startContent={
                    <Phone className="text-default-400" size={iconSize}/>
                  }
                  classNames={{
                    label: 'text-sm font-medium',
                    input: 'text-base',
                    inputWrapper: '!rounded-[0.62rem]',
                  }}
                  {...register('phone', addressValidationRules.phone)}
              />
              <Input
                  size={inputSize}
                  label={t('email')}
                  placeholder={t('emailPlaceholder')}
                  type="email"
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message?.toString()}
                  startContent={
                    <Mail className="text-default-400" size={iconSize}/>
                  }
                  classNames={{
                    label: 'text-sm font-medium',
                    input: 'text-base',
                    inputWrapper: '!rounded-[0.62rem]',
                  }}
                  {...register('email', addressValidationRules.email)}
              />
            </div>
          </CardBody>
        </Card>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          {onCancel && (
              <Button
                  variant="flat"
                  color="danger"
                  onPress={onCancel}
                  size={inputSize}
                  className="font-medium"
              >
                {t('cancel')}
              </Button>
          )}
          <Button
              type="submit"
              color="primary"
              isLoading={isSubmitting}
              size={inputSize}
              className="font-medium min-w-[140px]"
          >
            {submitLabel || t('save')}
          </Button>
        </div>
      </form>
  );
};
