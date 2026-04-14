"use client";

import {Controller, FieldValues, useForm} from "react-hook-form";
import {cn, Radio, RadioGroup} from "@heroui/react";
import {useEffect, useState} from "react";
import {useCustomToast} from "@utils/hooks/useToast";
import {ProceedToCheckout} from "../ProceedToCheckout";
import {CustomRadioProps} from "@components/checkout/type";
import {useDispatch} from "react-redux";
import {useRouter} from "next/navigation";
import {PaymentChannel} from "@utils/api/trade";
import {useAppSelector} from "@/store/hooks";
import {setPaymentMethod} from "@/store/slices/checkout-slice";

export default function PaymentMethod({
  methods,
  currentStep,
}: {
  methods: PaymentChannel[];
  currentStep?: string;
}) {
  const { showToast } = useCustomToast();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const {paymentMethod} = useAppSelector((state) => state.checkout);

  // 使用 useEffect 处理状态变化
  useEffect(() => {
    if (currentStep === "payment") {
      setIsOpen(false);
    } else if (paymentMethod) {
      setIsOpen(true);
    }
  }, [currentStep, paymentMethod]);

  const { handleSubmit, control } = useForm({
    mode: "onSubmit",
    defaultValues: {
      method: paymentMethod ?? "",
    },
  });

  // 找到当前选中的支付方式
  const selectedMethod = methods?.find(
      (method) => method?.id === paymentMethod,
  );

  const onSubmit = async (data: FieldValues) => {
    if (!data?.method) {
      showToast("Please Choose the Payment Method", "warning");
      return;
    }
    setIsPaymentLoading(true);
    try {
      const selectedMethod = methods?.find(
          (m) => m?.id === Number(data?.method),
      );
      if (selectedMethod) {
        dispatch(
            setPaymentMethod(Number(selectedMethod?.id || 0)),
        );
      }


      // 直接跳转到订单 review 页面
      router.replace("/checkout?step=review");
    } catch {
      showToast("Failed to save payment method. Please try again.");
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // 渲染支付方式选择表单
  const renderPaymentForm = () => (
      <div className="mt-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
              control={control}
              name="method"
              render={({field}) => (
                  <RadioGroup
                      label=""
                      value={String(field.value) ?? ""}
                      onValueChange={field.onChange}
                  >
                    {methods?.map((method) => (
                        <CustomRadio
                            key={method?.id}
                            className="my-1 border border-solid border-neutral-300 dark:border-neutral-500"
                            description={method?.remark}
                            value={method?.code}
                        >
                  <span className="text-neutral-700 dark:text-white">
                    {method?.code}
                  </span>
                        </CustomRadio>
                    ))}
                  </RadioGroup>
              )}
          />

          <div className="my-6 justify-self-end">
            <ProceedToCheckout
                buttonName="Next"
                pending={isPaymentLoading}
            />
          </div>
        </form>
      </div>
  );

  // 渲染已选择的支付方式
  const renderSelectedPayment = () => (
      <>
        <div className="mt-4  justify-between hidden sm:flex ">
          <div className="flex">
            <p className="w-auto text-base font-normal text-black/60 dark:text-white/60 sm:w-[192px]">
              Payment Method
            </p>
            <p className="text-base font-normal">
              {selectedMethod?.code}
            </p>
          </div>

          <button
              onClick={() => setIsOpen(false)}
              className="cursor-pointer text-base font-normal text-black/60 underline dark:text-neutral-300"
          >
            Change
          </button>
        </div>
        <div className="mt-4 flex sm:hidden justify-between relative">
          <div className="flex justify-between justify-between  flex-1 wrap">
            <p className="w-auto text-base font-normal text-black/60 dark:text-white/60 sm:w-[192px]">
              Payment Method
            </p>
            <p className="text-base font-normal">
              {selectedMethod?.code}
            </p>
          </div>

          <button
              onClick={() => setIsOpen(false)}
              className="cursor-pointer absolute right-0 text-base font-normal text-black/60 underline dark:text-neutral-300"
              style={{top: "-36px"}}
          >
            Change
          </button>
        </div>
      </>
  );

  return (
      <>
        {paymentMethod && isOpen ? (
            renderSelectedPayment()
        ) : (
            renderPaymentForm()
      )}
    </>
  );
}

const CustomRadio = (props: CustomRadioProps) => {
  const { children, ...otherProps } = props;

  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "inline-flex m-0 bg-transparent hover:bg-transparent items-center",
          "flex-row items-baseline max-w-full cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
          "data-[selected=true]:border-primary",
        ),
        hiddenInput: "peer absolute h-0 w-0 opacity-0",
      }}
    >
      {children}
    </Radio>
  );
};