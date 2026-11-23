// 通用地址表单组件
import {AddressType, AddressTypeConfig, FieldDefinition} from "@components/checkout/type";
import {FormField} from "@components/checkout/stepper/address/FormField";
import {IS_VALID_ADDRESS, IS_VALID_INPUT} from "@utils/constants";
import {AddressLine} from "@/types/api/address/type";
import {AddressSelector} from "@components/checkout/stepper/address/AddressSelector";
import {useState} from "react";

export const AddressFormSection = ({
                                     type,
                                     config,
                                     register,
                                     control,
                                     errors,
                                     isVisible = true,
                                     savedAddresses = [],
                                     selectedAddress,
                                     onSelectAddress,
                                     showAddressSelector = false,
                                   }: {
  type: AddressType;
  config: AddressTypeConfig;
  register: any;
  control: any;
  errors: any;
  isVisible?: boolean;
  savedAddresses?: AddressLine[];
  selectedAddress?: AddressLine | null;
  onSelectAddress?: (address: AddressLine | null) => void;
  showAddressSelector?: boolean;
}) => {
  const [localShowSelector, setLocalShowSelector] = useState(false);

  if (!isVisible) return null;

  const shouldShowSelector = showAddressSelector && savedAddresses.length > 0;

  // 字段定义配置 - 优化布局，根据内容长度分组
  // 短字段（如姓名、国家、城市等）放在同一行，一行最多三个
  const FIELD_DEFINITIONS: FieldDefinition[] = [
    // 第一行：名字（两个短字段）
    {
      name: 'firstName',
      label: 'First Name',
      required: true,
      colSpan: 'col-span-12 sm:col-span-6 lg:col-span-4',
      validation: IS_VALID_INPUT
    },
    {
      name: 'lastName',
      label: 'Last Name',
      required: true,
      colSpan: 'col-span-12 sm:col-span-6 lg:col-span-4',
      validation: IS_VALID_INPUT
    },
    {name: 'phone', label: 'Phone', required: true, colSpan: 'col-span-12 sm:col-span-6 lg:col-span-4', isPhone: true},

    // 第二行：公司名称（长字段，独占一行）- 不限制字符类型
    {
      name: 'companyName',
      label: 'Company Name',
      required: false,
      colSpan: 'col-span-12',
    },

    // 第三行：税号（两个短字段）
    {
      name: 'vat',
      label: 'VAT',
      required: false,
      colSpan: 'col-span-12 sm:col-span-6 lg:col-span-4',
      validation: IS_VALID_INPUT
    },
    {
      name: 'eori',
      label: 'EORI',
      required: false,
      colSpan: 'col-span-12 sm:col-span-6 lg:col-span-4',
      validation: IS_VALID_INPUT
    },
    {
      name: 'postcode',
      label: 'Zip Code',
      required: true,
      colSpan: 'col-span-12 sm:col-span-6 lg:col-span-4',
      validation: IS_VALID_INPUT
    },

    // 第四行：地址详情（长字段，独占一行）
    {name: 'address', label: 'Address', required: true, colSpan: 'col-span-12', validation: IS_VALID_ADDRESS},

    // 第五行：街道（长字段，独占一行）
    {name: 'street', label: 'Street', required: false, colSpan: 'col-span-12', validation: IS_VALID_ADDRESS},

    // 第六行：国家、州/省、城市（三个短字段）
    {
      name: 'country',
      label: 'Country',
      required: true,
      colSpan: 'col-span-12 sm:col-span-6 lg:col-span-4',
      isCountry: true
    },
    {
      name: 'state',
      label: 'State',
      required: false,
      colSpan: 'col-span-12 sm:col-span-6 lg:col-span-4',
      validation: IS_VALID_INPUT
    },
    {
      name: 'city',
      label: 'City',
      required: true,
      colSpan: 'col-span-12 sm:col-span-6 lg:col-span-4',
      validation: IS_VALID_INPUT
    },
  ];

  return (
      <div>
        <h3 className="text-lg font-semibold mb-3">{config.title}</h3>

        {shouldShowSelector && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-default-600">Saved Addresses</span>
                <button
                    type="button"
                    onClick={() => setLocalShowSelector(!localShowSelector)}
                    className="text-sm text-primary hover:underline"
                >
                  {localShowSelector ? 'Hide' : 'Show'}
                </button>
              </div>

              {localShowSelector && (
                  <AddressSelector
                      title=""
                      addresses={savedAddresses}
                      selectedAddress={selectedAddress || null}
                      onSelect={onSelectAddress || (() => {
                      })}
                  />
              )}
            </div>
        )}

        {/* 优化后的表单布局 - 短字段组合在同一行 */}
        <div className="grid grid-cols-12 gap-2 sm:gap-3">
          {FIELD_DEFINITIONS.map(field => (
              <FormField
                  key={field.name}
                  field={field}
                  prefix={type}
                  config={config}
                  register={register}
                  control={control}
                  errors={errors}
              />
          ))}
        </div>
      </div>
  );
};