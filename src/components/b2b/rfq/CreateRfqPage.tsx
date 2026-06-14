"use client";

import {useAppSelector} from "@/store/hooks";
import RfqCart from "./RfqCart";
import RfqStepper from "./stepper";
import {useForm} from "react-hook-form";
// 从 stepper 导入 Context 和类型
import {RfqFormContext, RfqFormData, RfqSubmitContext} from "./stepper/index";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createRfq} from "@utils/api/b2b";
import {useCustomToast} from "@utils/hooks/useToast";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {PressEvent} from "@heroui/button";

interface CreateRfqProps {
  step: string;
}

const CreateRfqPage = ({step}: CreateRfqProps) => {
  const t = useTranslations("b2b.createRfq");
  const {showToast} = useCustomToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const {cart} = useAppSelector((state) => state.cartDetail);

  // 在父级初始化表单，让所有子组件（RfqStepper 和 RfqCart）共享
  const methods = useForm<RfqFormData>({
    mode: "onChange",
    defaultValues: {
      contactName: "",
      email: "",
      country: "",
      city: "",
      postalCode: "",
      incoterms: "",
      deliveryPort: "",
      expectedDeliveryType: "",
      expectedDeliveryDate: "",
      targetCurrency: "",
      requirement: "",
      items: [],
    },
  });

  const {getValues} = methods;

  // 创建询价 Mutation - 统一在父级管理
  const createRfqMutation = useMutation({
    mutationFn: async () => {
      const data = getValues();
      const mapDeliveryTypeToBackend = (type: string | undefined): string | undefined => {
        const map: Record<string, string> = {
          "ASAP": "ASAP",
          "WITHIN_30_DAYS": "30DAYS",
          "WITHIN_60_DAYS": "60DAYS",
          "CUSTOM_DATE": "DATE",
        };
        return type ? map[type] : undefined;
      };

      return createRfq({
        items: data.items?.map(item => ({
          skuId: item.skuId,
          count: item.count,
          expectedPrice: item.expectedPrice,
        })),
        contactName: data.contactName,
        email: data.email,
        country: data.country,
        city: data.city,
        postalCode: data.postalCode,
        incoterms: data.incoterms,
        deliveryPort: data.deliveryPort,
        expectedDeliveryType: mapDeliveryTypeToBackend(data.expectedDeliveryType),
        expectedDeliveryDate: data.expectedDeliveryDate,
        targetCurrency: data.targetCurrency,
        requirement: data.requirement,
      });
    },
    onSuccess: async () => {
      showToast(t("success"), "success");
      await queryClient.invalidateQueries({queryKey: ["cart"]});
      router.push("/account/rfqs");
    },
    onError: () => {
      showToast(t("failed"), "danger");
    },
  });

  const handleSubmit = (_e: PressEvent) => {
    createRfqMutation.mutate();
  };

  // 购物车为空
  if (!cart?.items || cart.items.length === 0) {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-semibold mb-4">{t("cartEmpty")}</h2>
        </div>
    );
  }

  return (
      // Provider 放在父级，包裹左右两列
      <RfqFormContext.Provider value={methods}>
        <RfqSubmitContext.Provider value={handleSubmit}>
          <section className="flex flex-col items-start justify-between lg:flex-row lg:justify-between">
            {/* 左侧表单 60% */}
            <div className="w-full px-0 py-2 sm:px-4 sm:py-4 lg:w-3/5 xl:pl-16 xl:pr-0">
              <RfqStepper currentStep={step}/>
            </div>

            {/* 右侧摘要 40% - 与 checkout 完全一致 */}
            <div
                className="h-full w-full !z-0 justify-self-start border-0 border-l border-none border-black/[10%] dark:border-neutral-700 lg:w-2/5 lg:border-solid">
              <div className="max-h-auto w-full flex-initial flex-shrink-0 flex-grow-0 lg:sticky lg:top-0">
                <RfqCart currentStep={step} isSubmitting={createRfqMutation.isPending}/>
              </div>
            </div>
          </section>
        </RfqSubmitContext.Provider>
      </RfqFormContext.Provider>
  );
};

export default CreateRfqPage;