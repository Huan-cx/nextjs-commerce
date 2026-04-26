import {AddressType, AddressTypeConfig, FieldDefinition} from "@components/checkout/type";
import CountrySelect from "@components/common/form/country";
import InputText from "@components/common/form/Input";

export const FormField = ({
                            field,
                            prefix,
                            config,
                            register,
                            control,
                            errors,
                          }: {
  field: FieldDefinition;
  prefix: AddressType;
  config: AddressTypeConfig;
  register: any;
  control: any;
  errors: any;
}) => {
  const fieldName = `${prefix}.${field.name}`;
  const fieldError = errors?.[prefix]?.[field.name]?.message;
  const isRequired = field.required || config.requiredFields?.includes(field.name);

  // 跳过不显示的字段
  if (!config.showCompanyFields && (field.name === 'companyName' || field.name === 'vat' || field.name === 'eori')) {
    return null;
  }

  if (!config.showVatEoriFields && (field.name === 'vat' || field.name === 'eori')) {
    return null;
  }

  if (field.isCountry) {
    return (
        <CountrySelect
            key={fieldName}
            control={control}
            name={fieldName}
            label={field.label}
            required
            errorMsg={fieldError}
            className={field.colSpan}
        />
    );
  }

  return (
      <InputText
          key={fieldName}
          {...register(fieldName, {
            required: isRequired ? `${field.label} is required` : undefined,
            pattern: field.validation ? {
              value: field.validation,
              message: `Invalid ${field.label}`,
            } : undefined,
          })}
          className={field.colSpan}
          errorMsg={fieldError}
          label={field.label}
          size="md"
          type={field.isPhone ? 'tel' : undefined}
          inputMode={field.isPhone ? 'tel' : undefined}
          autoComplete={field.isPhone ? 'tel' : undefined}
      />
  );
};