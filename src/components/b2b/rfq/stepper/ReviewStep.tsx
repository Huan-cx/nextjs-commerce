"use client";

import {Button} from "@heroui/react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {useRfqForm, useRfqSubmit} from "./index";

export default function ReviewStep() {
  const t = useTranslations("b2b.createRfq");
  const router = useRouter();
  const {watch} = useRfqForm();
  const handleSubmit = useRfqSubmit();

  // Use watch() to get reactive form data instead of getValues() which is static
  const formData = watch();

  const onSubmit = handleSubmit;

  const getDeliveryTypeText = (type: string | undefined) => {
    if (!type) return "-";
    return t(`expectedDeliveryTypeOptions.${type}`);
  };

  const handlePrev = () => {
    router.push("/rfqs/create?step=price");
  };

  return (
      <div className="space-y-6">
        {/* 联系信息 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-medium mb-3">{t("contactInfo")}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{t("contactName")}:</span>
              <span className="font-medium">{formData.contactName || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("email")}:</span>
              <span className="font-medium">{formData.email || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("country")}:</span>
              <span className="font-medium">{formData.country || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("city")}:</span>
              <span className="font-medium">{formData.city || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("postalCode")}:</span>
              <span className="font-medium">{formData.postalCode || "-"}</span>
            </div>
          </div>
        </div>

        {/* 运输信息 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-medium mb-3">{t("shippingInfo")}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{t("incoterms")}:</span>
              <span className="font-medium">{formData.incoterms || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("deliveryPort")}:</span>
              <span className="font-medium">{formData.deliveryPort || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("expectedDeliveryType")}:</span>
              <span className="font-medium">{getDeliveryTypeText(formData.expectedDeliveryType)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("expectedDeliveryDate")}:</span>
              <span className="font-medium">{formData.expectedDeliveryDate || "-"}</span>
            </div>
          </div>
        </div>

        {/* 价格与需求 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-medium mb-3">{t("pricingInfo")}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{t("targetCurrency")}:</span>
              <span className="font-medium">{formData.targetCurrency || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("targetPrice")}:</span>
              <span className="font-medium">{formData.targetPrice || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("targetPriceUnit")}:</span>
              <span className="font-medium">{formData.targetPrice || "-"}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-500">{t("requirement")}:</span>
              <span className="font-medium text-right max-w-[60%] break-words">
              {formData.requirement || "-"}
            </span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-between pt-4">
          <Button variant="flat" size="lg" onPress={handlePrev}>
            {t("prev")}
          </Button>
          <Button color="primary" size="lg" onPress={onSubmit}>
            {t("submit")}
          </Button>
        </div>
      </div>
  );
}