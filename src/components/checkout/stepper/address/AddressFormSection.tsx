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

// 字段定义配置
  const FIELD_DEFINITIONS: FieldDefinition[] = [
    {
      name: 'firstName',
      label: 'First Name',
      required: true,
      colSpan: 'col-span-6 xxs:col-span-3 mb-4',
      validation: IS_VALID_INPUT
    },
    {
      name: 'lastName',
      label: 'Last Name',
      required: true,
      colSpan: 'col-span-6 xxs:col-span-3 mb-4',
      validation: IS_VALID_INPUT
    },
    {
      name: 'companyName',
      label: 'Company Name',
      required: false,
      colSpan: 'col-span-6 mb-2',
      validation: IS_VALID_INPUT
    },
    {name: 'vat', label: 'VAT', required: false, colSpan: 'col-span-6 mb-2', validation: IS_VALID_INPUT},
    {name: 'eori', label: 'EORI', required: false, colSpan: 'col-span-6 mb-2', validation: IS_VALID_INPUT},
    {name: 'address', label: 'Address', required: true, colSpan: 'col-span-6 mb-4', validation: IS_VALID_ADDRESS},
    {name: 'street', label: 'Street', required: true, colSpan: 'col-span-6 mb-4', validation: IS_VALID_ADDRESS},
    {name: 'country', label: 'Country', required: true, colSpan: 'col-span-6 xxs:col-span-3 mb-4', isCountry: true},
    {
      name: 'state',
      label: 'State',
      required: true,
      colSpan: 'col-span-6 xxs:col-span-3 mb-4',
      validation: IS_VALID_INPUT
    },
    {
      name: 'city',
      label: 'City',
      required: true,
      colSpan: 'col-span-6 xxs:col-span-3 mb-4',
      validation: IS_VALID_INPUT
    },
    {
      name: 'postcode',
      label: 'Zip Code',
      required: true,
      colSpan: 'col-span-6 xxs:col-span-3',
      validation: IS_VALID_INPUT
    },
    {name: 'phone', label: 'Phone', required: true, colSpan: 'col-span-6', isPhone: true},
  ];

  return (
      <div>
        <h3 className="text-lg font-semibold mb-4">{config.title}</h3>

        {shouldShowSelector && (
            <div className="mb-4">
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

        <div className="my-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* 表单字段 */}
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