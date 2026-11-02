"use client";

import {Button} from "@heroui/react";
import {useRouter} from "next/navigation";
import {useRfqForm} from "./index";
import InputText from "@components/common/form/Input";
import CountrySelect from "@components/common/form/country";
import {useTranslations} from "next-intl";

export default function ContactStep() {
  const t = useTranslations("b2b.createRfq");
  const router = useRouter();
  const {
    register,
    control,
    formState: {errors},
    watch,
  } = useRfqForm();

  // 获取当前字段值
  const contactName = watch("contactName");
  const email = watch("email");
  const country = watch("country");
  const city = watch("city");
  const postalCode = watch("postalCode");

  // 检查当前步骤所有必填字段是否填写
  const isContactStepValid = () => {
    // 检查字段是否有错误
    const hasErrors = !!(
        errors.contactName ||
        errors.email ||
        errors.country ||
        errors.city ||
        errors.postalCode
    );

    // 检查字段是否有值（非空）
    const hasValues = !!(
        contactName &&
        email &&
        country &&
        city &&
        postalCode
    );

    return !hasErrors && hasValues;
  };

  const handleNext = () => {
    if (isContactStepValid()) {
      router.push("/rfqs/create?step=delivery");
    }
  };

  return (
      <div className="space-y-4">
        <InputText
            label={t("contactName")}
            placeholder={t("contactNamePlaceholder")}
            {...register("contactName", {required: t("contactNameRequired")})}
            errorMsg={errors.contactName?.message?.toString()}
            size="md"
            className="max-w-full"
        />

        <InputText
            label={t("email")}
            placeholder={t("emailPlaceholder")}
            type="email"
            {...register("email", {
              required: t("emailRequired"),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t("emailInvalid"),
              },
            })}
            errorMsg={errors.email?.message?.toString()}
            size="md"
            className="max-w-full"
        />

        <CountrySelect
            control={control}
            name="country"
            label={t("country")}
            placeholder={t("countryPlaceholder")}
            errorMsg={errors.country?.message?.toString()}
            rules={{required: t("countryRequired")}}
            required
            size="md"
            className="max-w-full"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputText
              label={t("city")}
              placeholder={t("cityPlaceholder")}
              {...register("city", {required: t("cityRequired")})}
              errorMsg={errors.city?.message?.toString()}
              size="md"
              className="max-w-full"
          />
          <InputText
              label={t("postalCode")}
              placeholder={t("postalCodePlaceholder")}
              {...register("postalCode", {required: t("postalCodeRequired")})}
              errorMsg={errors.postalCode?.message?.toString()}
              size="md"
              className="max-w-full"
          />
        </div>

        <div className="flex justify-end pt-6">
          <Button
              color="primary"
              size="lg"
              onPress={handleNext}
              isDisabled={!isContactStepValid()}
              className="font-outfit text-base font-medium"
          >
            {t("next")}
          </Button>
        </div>
      </div>
  );
}