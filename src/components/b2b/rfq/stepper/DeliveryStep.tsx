"use client";

import {Button, Select, SelectItem} from "@heroui/react";
import {useRouter} from "next/navigation";
import {useRfqForm} from "./index";
import InputText from "@components/common/form/Input";
import {useTranslations} from "next-intl";

export default function DeliveryStep() {
  const t = useTranslations("b2b.createRfq");
  const router = useRouter();
  const {
    register,
    setValue,
    watch,
    formState: {errors, isValid},
  } = useRfqForm();

  const incoterms = watch("incoterms");
  const expectedDeliveryType = watch("expectedDeliveryType");

  const incotermsOptions = [
    {value: "FOB", label: t("incotermsOptions.FOB")},
    {value: "CIF", label: t("incotermsOptions.CIF")},
    {value: "EXW", label: t("incotermsOptions.EXW")},
    {value: "DAP", label: t("incotermsOptions.DAP")},
    {value: "DDP", label: t("incotermsOptions.DDP")},
  ];

  const deliveryTypeOptions = [
    {value: "ASAP", label: t("expectedDeliveryTypeOptions.ASAP")},
    {value: "WITHIN_30_DAYS", label: t("expectedDeliveryTypeOptions.WITHIN_30_DAYS")},
    {value: "WITHIN_60_DAYS", label: t("expectedDeliveryTypeOptions.WITHIN_60_DAYS")},
    {value: "CUSTOM_DATE", label: t("expectedDeliveryTypeOptions.CUSTOM_DATE")},
  ];

  const handleNext = () => {
    if (isValid) {
      router.push("/rfqs/create?step=price");
    }
  };

  const handlePrev = () => {
    router.push("/rfqs/create");
  };

  return (
      <div className="space-y-4">
        <div className="max-w-full mb-2.5">
          <label className="px-1 mb-1 block font-medium text-black dark:text-white">
            {t("incoterms")} <span className="text-red-500">*</span>
          </label>
          <Select
              placeholder={t("incotermsPlaceholder")}
              selectedKeys={incoterms ? [incoterms] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setValue("incoterms", value, {shouldValidate: true});
              }}
              errorMessage={errors.incoterms?.message?.toString()}
              size="lg"
              classNames={{
                base: "w-full",
                trigger: "!rounded-[0.62rem] border border-gray-300 dark:border-gray-500 bg-transparent",
                value: "text-gray-900 dark:text-white",
              }}
          >
            {incotermsOptions.map((opt) => (
                <SelectItem key={opt.value} textValue={opt.label}>
                  {opt.label}
                </SelectItem>
            ))}
          </Select>
        </div>

        <InputText
            label={t("deliveryPort")}
            placeholder={t("deliveryPortPlaceholder")}
            {...register("deliveryPort", {required: t("incotermsRequired")})}
            errorMsg={errors.deliveryPort?.message?.toString()}
            size="md"
            className="max-w-full"
        />

        <div className="max-w-full mb-2.5">
          <label className="px-1 mb-1 block font-medium text-black dark:text-white">
            {t("expectedDeliveryType")}
          </label>
          <Select
              placeholder={t("expectedDeliveryTypePlaceholder")}
              selectedKeys={expectedDeliveryType ? [expectedDeliveryType] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setValue("expectedDeliveryType", value);
              }}
              size="lg"
              classNames={{
                base: "w-full",
                trigger: "!rounded-[0.62rem] border border-gray-300 dark:border-gray-500 bg-transparent",
                value: "text-gray-900 dark:text-white",
              }}
          >
            {deliveryTypeOptions.map((opt) => (
                <SelectItem key={opt.value} textValue={opt.label}>
                  {opt.label}
                </SelectItem>
            ))}
          </Select>
        </div>

        {expectedDeliveryType === "CUSTOM_DATE" && (
            <InputText
                label={t("expectedDeliveryDate")}
                type="date"
                {...register("expectedDeliveryDate")}
                size="md"
                className="max-w-full"
            />
        )}

        <div className="flex justify-between pt-6">
          <Button
              variant="flat"
              size="lg"
              onPress={handlePrev}
              className="font-outfit text-base font-medium"
          >
            {t("prev")}
          </Button>
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
