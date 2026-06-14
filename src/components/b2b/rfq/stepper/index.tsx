"use client";

import ContactStep from "./ContactStep";
import DeliveryStep from "./DeliveryStep";
import PriceStep from "./PriceStep";
import ReviewStep from "./ReviewStep";
import {useForm} from "react-hook-form";
import React from "react";
import {useTranslations} from "next-intl";
import {PressEvent} from "@heroui/button";

// ==========================================
// 表单数据类型 + Context (统一放在这里)
// ==========================================

export interface RfqItem {
  skuId: number;
  count: number;
  expectedPrice?: number;
}

export interface RfqFormData {
  targetPrice: string;
  contactName: string;
  email: string;
  country?: string;
  city?: string;
  postalCode?: string;
  incoterms: string;
  deliveryPort: string;
  expectedDeliveryType?: string;
  expectedDeliveryDate?: string;
  targetCurrency?: string;
  requirement?: string;
  items?: RfqItem[];
}

export const RfqFormContext = React.createContext<ReturnType<typeof useForm<RfqFormData>> | null>(null);

// 提交回调 Context - 让 ReviewStep 可以触发表单提交
export const RfqSubmitContext = React.createContext<((e: PressEvent) => void) | undefined>(undefined);

export const useRfqForm = () => {
  const context = React.useContext(RfqFormContext);
  if (!context) {
    throw new Error("useRfqForm must be used within RfqFormContext.Provider");
  }
  return context;
};

export const useRfqSubmit = () => {
  return React.useContext(RfqSubmitContext);
};

// ==========================================
// Stepper 组件
// ==========================================

interface Step {
  id: number;
  key: string;
  title: string;
  href: string;
  component: React.ReactNode;
}

interface RfqStepperProps {
  currentStep: string;
}

export default function RfqStepper({currentStep}: RfqStepperProps) {
  const t = useTranslations("b2b.createRfq");

  // 注意：这里不再自己创建 useForm，而是从 Context 获取
  // Context 由父级 CreateRfqPage 提供

  const steps: Step[] = [
    {
      id: 1,
      key: "contact",
      title: t("steps.contact"),
      href: "/rfqs/create",
      component: <ContactStep/>,
    },
    {
      id: 2,
      key: "delivery",
      title: t("steps.delivery"),
      href: "/rfqs/create?step=contact",
      component: <DeliveryStep/>,
    },
    {
      id: 3,
      key: "price",
      title: t("steps.price"),
      href: "/rfqs/create?step=delivery",
      component: <PriceStep/>,
    },
    {
      id: 4,
      key: "review",
      title: t("steps.review"),
      href: "/rfqs/create?step=price",
      component: <ReviewStep/>,
    },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  const StepItem = ({step}: { step: Step }) => {
    const isActive = step.key === currentStep;
    const isCompleted = step.id <= (steps[currentStepIndex]?.id || 1);

    return (
        <div key={step.id} className="flex w-full flex-col">
          <div className="flex items-center justify-between font-outfit">
            <div className="flex items-center gap-3">
              <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      isCompleted
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-neutral-900 dark:bg-gray-700 dark:text-neutral-300"
                  }`}
              >
                {step.id}
              </div>
              <span
                  className={`text-lg font-medium max-md:text-base ${
                      isActive
                          ? "font-medium text-neutral-900 dark:text-neutral-300"
                          : "text-neutral-500 dark:text-neutral-400"
                  }`}
              >
              {step.title}
            </span>
            </div>
          </div>

          {isActive && (
              <section className="relative mt-6">
                {step.component}
              </section>
          )}
        </div>
    );
  };

  return (
      <div className="mx-auto w-full">
        <header className="pb-6 sm:py-6">
          <h1 className="text-xl px-2 font-outfit font-semibold text-black dark:text-white">
            {t("title")}
          </h1>
        </header>

        <div
            className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-500 dark:scrollbar-thumb-neutral-300 h-[calc(100dvh-300px)] overflow-y-auto lg:h-[calc(100dvh-124px)]">
          <div className="flex h-full flex-col gap-y-8 pl-2 pr-6 sm:px-3 sm:pr-10">
            {steps.map((step) => (
                <StepItem key={step.id} step={step}/>
            ))}
          </div>
        </div>
      </div>
  );
}