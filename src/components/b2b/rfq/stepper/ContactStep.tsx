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
    formState: {errors, isValid},
  } = useRfqForm();

  const handleNext = () => {
    if (isValid) {
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
            size="md"
            className="max-w-full"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputText
              label={t("city")}
              placeholder={t("cityPlaceholder")}
              {...register("city")}
              size="md"
              className="max-w-full"
          />
          <InputText
              label={t("postalCode")}
              placeholder={t("postalCodePlaceholder")}
              {...register("postalCode")}
              size="md"
              className="max-w-full"
          />
        </div>

        <div className="flex justify-end pt-6">
          <Button
              color="primary"
              size="lg"
              onPress={handleNext}
              isDisabled={!isValid}
              className="font-outfit text-base font-medium"
          >
            {t("next")}
          </Button>
        </div>
      </div>
  );
}
