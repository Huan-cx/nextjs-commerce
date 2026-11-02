"use client";

import {Button, Select, SelectItem, Textarea} from "@heroui/react";
import {useRouter} from "next/navigation";
import {useRfqForm} from "./index";
import {useTranslations} from "next-intl";

export default function PriceStep() {
  const t = useTranslations("b2b.createRfq");
  const router = useRouter();
  const {
    register,
    setValue,
    watch,
  } = useRfqForm();

  const targetCurrency = watch("targetCurrency");

  const currencyOptions = [
    {value: "USD", label: t("targetCurrencyOptions.USD")},
    {value: "EUR", label: t("targetCurrencyOptions.EUR")},
    {value: "CNY", label: t("targetCurrencyOptions.CNY")},
    {value: "GBP", label: t("targetCurrencyOptions.GBP")},
    {value: "JPY", label: t("targetCurrencyOptions.JPY")},
  ];

  const handleNext = () => {
    router.push("/rfqs/create?step=review");
  };

  const handlePrev = () => {
    router.push("/rfqs/create?step=delivery");
  };

  return (
      <div className="space-y-4">
        <div className="max-w-full mb-2.5">
          <label className="px-1 mb-1 block font-medium text-black dark:text-white">
            {t("targetCurrency")}
          </label>
          <Select
              placeholder={t("targetCurrencyPlaceholder")}
              selectedKeys={targetCurrency ? [targetCurrency] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setValue("targetCurrency", value);
              }}
              size="lg"
              classNames={{
                base: "w-full",
                trigger: "!rounded-[0.62rem] border border-gray-300 dark:border-gray-500 bg-transparent",
                value: "text-gray-900 dark:text-white",
              }}
          >
            {currencyOptions.map((opt) => (
                <SelectItem key={opt.value} textValue={opt.label}>
                  {opt.label}
                </SelectItem>
            ))}
          </Select>
        </div>

        <div className="max-w-full mb-2.5">
          <label className="px-1 mb-1 block font-medium text-black dark:text-white">
            {t("requirement")}
          </label>
          <Textarea
              placeholder={t("requirementPlaceholder")}
              {...register("requirement")}
              minRows={4}
              size="lg"
              classNames={{
                base: "w-full",
                inputWrapper: "!rounded-[0.62rem] border border-gray-300 dark:border-gray-500 bg-transparent",
                input: "text-gray-900 dark:text-white",
              }}
          />
        </div>

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
              className="font-outfit text-base font-medium"
          >
            {t("next")}
          </Button>
        </div>
      </div>
  );
}
