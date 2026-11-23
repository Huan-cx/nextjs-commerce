"use client";

import {Controller, FieldValues, useForm} from "react-hook-form";
import {cn, Radio, RadioGroup} from "@heroui/react";
import {useEffect, useState} from "react";
import {ProceedToCheckout} from "../ProceedToCheckout";
import {useCustomToast} from "@utils/hooks/useToast";
import {CustomRadioProps} from "@components/checkout/type";
import {useDispatch} from "react-redux";
import {useRouter} from "next/navigation";
import {ShippingChannel} from "@utils/api/trade";
import {useAppSelector} from "@/store/hooks";
import {setDeliveryType} from "@/store/slices/checkout-slice";


export default function ShippingMethod({
  shippingMethod,
  currentStep
}: {
  shippingMethod?: ShippingChannel[];
  methodDesc?: string;
  currentStep?: string;
}) {
  const { showToast } = useCustomToast();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const {deliveryType} = useAppSelector((state) => state.checkout);

  // 使用 useEffect 处理状态变化
  useEffect(() => {
    if (currentStep === "shipping") {
      setIsOpen(false);
    } else if (deliveryType) {
      setIsOpen(true);
    }
  }, [currentStep, deliveryType]);

  const { control, handleSubmit } = useForm({
    mode: "onSubmit",
    defaultValues: {
      id: deliveryType?.toString() || shippingMethod?.[0]?.id?.toString(),
    },
  });

  // 找到当前选中的配送方式
  const selectedMethod = shippingMethod?.find(
      (method) => method.id === deliveryType
  );

  const onSubmit = async (data: FieldValues) => {
    if (!data?.id) {
      showToast("Please Choose the Shipping Method", "warning");
      return;
    }
    setIsSaving(true);
    try {
      const selectedRate = shippingMethod?.find(m => m.id === parseInt(data.id));
      if (selectedRate) {
        dispatch(setDeliveryType(selectedRate.id));
      }
      // 直接跳转到支付步骤
      router.replace("/checkout?step=payment");
    } catch {
      showToast("Failed to save shipping method. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // 渲染配送方式选择表单
  const renderShippingForm = () => (
      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          {Array.isArray(shippingMethod) && (
              <Controller
                  control={control}
                  name="id"
                  render={({field}) => (
                      <RadioGroup
                          label=""
                          value={field.value}
                          onValueChange={field.onChange}
                      >
                        {shippingMethod.map((method) => (
                            <CustomRadio
                                key={method.id}
                                className="inset-0 my-1 border border-solid border-neutral-300 dark:border-neutral-500"
                                description={`${method.price}`}
                                value={method.id.toString()}
                            >
                    <span className="text-neutral-700 dark:text-white">
                      {method.name}
                    </span>
                            </CustomRadio>
                        ))}
                      </RadioGroup>
                  )}
              />
          )}
        </div>

        <div className="my-6 justify-self-end">
          <ProceedToCheckout buttonName="Next" pending={isSaving}/>
        </div>
      </form>
  );

  // 渲染已选择的配送方式
  const renderSelectedShipping = () => (
      <>
        <div className="mt-4  justify-between hidden sm:flex">
          <div className="flex">
            <p className="w-auto text-base font-normal text-black/60 dark:text-white/60 sm:w-[192px]">
              Shipping Method
            </p>
            <p className="text-base font-normal">{selectedMethod?.name} (${selectedMethod?.price})</p>
          </div>
          <div className="flex">
            <button
                onClick={() => setIsOpen(false)}
                className="cursor-pointer text-base font-normal text-black/[60%] underline dark:text-neutral-300"
            >
              Change
            </button>
          </div>
        </div>

        <div className="mt-4 block sm:hidden flex flex-col justify-between sm:flex-row relative">
          <div className="flex justify-between  flex-1 wrap">
            <p className="w-auto text-base font-normal text-black/60 dark:text-white/60 sm:w-[192px]">
              Shipping Method
            </p>
            <p className="text-base font-normal">{selectedMethod?.name} (${selectedMethod?.price})</p>
          </div>

          <button
              onClick={() => setIsOpen(false)}
              className="cursor-pointer absolute right-0  text-base font-normal text-black/[60%] underline dark:text-neutral-300"
              style={{top: "-36px"}}
          >
            Change
          </button>
        </div>
      </>
  );

  return (
      <div>
        {deliveryType && isOpen ? (
            renderSelectedShipping()
        ) : (
            renderShippingForm()
      )}
    </div>
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
          "data-[selected=true]:border-primary"
        ),
        hiddenInput: "peer absolute h-0 w-0 opacity-0",
      }}
    >
      {children}
    </Radio>
  );
};