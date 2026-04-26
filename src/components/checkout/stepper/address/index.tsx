"use client";
import {FC, useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useForm, useWatch} from "react-hook-form";
import {isObject} from "@/utils/type-guards";
import {useQuery} from "@tanstack/react-query";
import {getAddressList} from "@utils/api/address";
import {ProceedToCheckout} from "../ProceedToCheckout";
import CheckBox from "@components/theme/ui/element/Checkbox";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {
  setBillingAddress,
  setBusinessAddress,
  setReceiverAddress,
  toggleBusinessUseBilling,
  toggleReceiveUseBilling
} from "@/store/slices/checkout-slice";
import {AddressLine} from "@/types/api/address/type";
import {useCheckout} from "@utils/hooks/useCheckout";

import {AddressDisplay} from "@components/checkout/stepper/address/AddressDisplay";
import {AddressFormData, AddressType, AddressTypeConfig, CheckoutFormData} from "@components/checkout/type";
import {AddressFormSection} from "@components/checkout/stepper/address/AddressFormSection";

// 地址类型常量
const ADDRESS_TYPES = {
  BILLING: 1,
  RECEIVER: 2,
  BUSINESS: 3,
} as const;


// 地址类型配置
const ADDRESS_TYPE_CONFIG: Record<AddressType, AddressTypeConfig> = {
  billing: {
    title: "Billing Address",
    addressType: 1,
    showCompanyFields: true,
    showVatEoriFields: true,
  },
  receiver: {
    title: "Receiver Address",
    addressType: 2,
    showCompanyFields: true,
    showVatEoriFields: false,
  },
  business: {
    title: "Business Address",
    addressType: 3,
    showCompanyFields: true,
    showVatEoriFields: true,
    requiredFields: ['companyName', 'vat'],
  },
};

// 地址类型


// 辅助函数：创建地址表单数据
const createAddressFormData = (address: AddressLine | null, email: string | null): AddressFormData => ({
  email: address?.email ?? email ?? "",
  firstName: address?.firstName || "",
  lastName: address?.lastName || "",
  companyName: address?.companyName || "",
  address: address?.address || "",
  street: address?.street || "",
  country: address?.country || "",
  state: address?.state || "",
  city: address?.city || "",
  postcode: address?.postcode || "",
  phone: address?.phone || "",
  vat: address?.vat || "",
  eori: address?.eori || "",
});

// 辅助函数：创建地址数据
const createAddressData = (formData: AddressFormData, type: number): AddressLine => ({
  ...formData,
  id: 0,
  defaultStatus: true,
  type,
});

// 辅助函数：生成完整的表单数据
const generateFormDefaultValues = (
    billingAddress: AddressLine | null,
    receiverAddress: AddressLine | null,
    businessAddress: AddressLine | null,
    email: string | null,
    receiveUseBilling: boolean,
    businessUseBilling: boolean
): CheckoutFormData => ({
  billing: createAddressFormData(billingAddress, email),
  receiver: createAddressFormData(receiverAddress, email),
  business: createAddressFormData(businessAddress, email),
  receiveUseBilling,
  businessUseBilling,
});


export const AddAddressForm: FC = () => {
  const dispatch = useAppDispatch();
  const {
    billingAddress,
    receiverAddress,
    businessAddress,
    receiveUseBilling,
    businessUseBilling,
    email,
  } = useAppSelector((state) => state.checkout);

  // 获取已保存的地址列表
  const {data: savedAddresses = []} = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddressList,
  });

  // 地址选择状态
  const [selectedAddresses, setSelectedAddresses] = useState<Record<AddressType, AddressLine | null>>({
    billing: null,
    receiver: null,
    business: null,
  });

  const [isOpen, setIsOpen] = useState(
      isObject(receiverAddress) && isObject(billingAddress) && isObject(businessAddress)
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm({
    mode: "onSubmit",
    defaultValues: generateFormDefaultValues(
        billingAddress,
        receiverAddress,
        businessAddress,
        email,
        receiveUseBilling,
        businessUseBilling
    ),
  });

  useEffect(() => {
    reset(generateFormDefaultValues(
        billingAddress,
        receiverAddress,
        businessAddress,
        email,
        receiveUseBilling,
        businessUseBilling
    ));
  }, [billingAddress, receiverAddress, businessAddress, reset, email, receiveUseBilling, businessUseBilling]);
  const {isLoadingToSave} = useCheckout();
  const router = useRouter();

  const watchReceiveUseBilling = useWatch({
    control,
    name: "receiveUseBilling",
    defaultValue: receiveUseBilling,
  });

  const watchBusinessUseBilling = useWatch({
    control,
    name: "businessUseBilling",
    defaultValue: businessUseBilling,
  });

  const formValues = useWatch({
    control,
    defaultValue: {
      billing: createAddressFormData(billingAddress, email),
      receiver: createAddressFormData(receiverAddress, email),
      business: createAddressFormData(businessAddress, email),
      receiveUseBilling,
      businessUseBilling,
    },
  });

  const addGuestAddress = useCallback(async (data: CheckoutFormData) => {
    const {billing, receiver, business, receiveUseBilling, businessUseBilling} = data;

    const receiverSource = receiveUseBilling ? billing : receiver;
    const businessSource = businessUseBilling ? billing : business;

    try {
      dispatch(setBillingAddress(createAddressData(billing, ADDRESS_TYPES.BILLING)));
      dispatch(setReceiverAddress(createAddressData(receiverSource, ADDRESS_TYPES.RECEIVER)));
      dispatch(setBusinessAddress(createAddressData(businessSource, ADDRESS_TYPES.BUSINESS)));
      dispatch(toggleReceiveUseBilling(receiveUseBilling));
      dispatch(toggleBusinessUseBilling(businessUseBilling));
      router.replace("/checkout?step=shipping");
    } catch (error) {
      console.error("Failed to save checkout address", error);
    }
  }, [dispatch, router]);

  const handleSelectAddress = useCallback((address: AddressLine | null, type: AddressType) => {
    const currentReceiveUseBilling = watchReceiveUseBilling;
    const currentBusinessUseBilling = watchBusinessUseBilling;

    // 更新选中状态
    setSelectedAddresses(prev => ({...prev, [type]: address}));

    // 如果是账单地址且启用了联动，清空其他选中状态
    if (type === 'billing') {
      if (currentReceiveUseBilling) {
        setSelectedAddresses(prev => ({...prev, receiver: null}));
      }
      if (currentBusinessUseBilling) {
        setSelectedAddresses(prev => ({...prev, business: null}));
      }
    }

    // 生成新的表单数据
    const newFormData = {
      billing: formValues.billing,
      receiver: formValues.receiver,
      business: formValues.business,
      receiveUseBilling: currentReceiveUseBilling,
      businessUseBilling: currentBusinessUseBilling,
    };

    // 更新对应类型的地址数据
    newFormData[type] = address ? createAddressFormData(address, email) : createAddressFormData(null, email);

    reset(newFormData);
  }, [formValues, watchReceiveUseBilling, watchBusinessUseBilling, email, reset]);

  const showSummary = isObject(receiverAddress) && (isObject(billingAddress) || watchReceiveUseBilling) && (isObject(businessAddress) || watchBusinessUseBilling);
  if (showSummary && isOpen) {
    return (
        <>
          <div className="mt-4  items-start  hidden sm:flex">
            <div className="flex flex-col justify-between w-full">
              <AddressDisplay
                  title="Billing Address"
                  address={billingAddress}
                  className="flex"
              />
              <AddressDisplay
                  title="Receiver Address"
                  address={receiverAddress}
                  className="flex"
              />
              <AddressDisplay
                  title="Business Address"
                  address={businessAddress}
                  className="flex"
                  showVat={true}
              />
            </div>

            <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="cursor-pointer text-base font-normal text-black/[60%] underline dark:text-neutral-300"
            >
              Change
            </button>
          </div>
          <div className="mt-4 flex sm:hidden items-start justify-between relative">
            <div className="flex flex-col justify-between w-full">
              <AddressDisplay
                  title="Billing Address"
                  address={billingAddress}
                  className="flex justify-between flex-1 wrap"
              />
              <AddressDisplay
                  title="Receiver Address"
                  address={receiverAddress}
                  className="flex justify-between flex-1 wrap"
              />
              <AddressDisplay
                  title="Business Address"
                  address={businessAddress}
                  className="flex justify-between flex-1 wrap"
                  showVat={true}
              />
            </div>

            <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="cursor-pointer absolute right-0 text-base font-normal text-black/[60%] underline dark:text-neutral-300"
                style={{top: "-36px"}}
            >
              Change
            </button>
          </div>
        </>
    );
  }

  return (
      <form className="my-5" onSubmit={handleSubmit(addGuestAddress)}>
        {/* 账单地址表单 */}
        <AddressFormSection
            type="billing"
            config={ADDRESS_TYPE_CONFIG.billing}
            register={register}
            control={control}
            errors={errors}
            savedAddresses={savedAddresses.filter(addr => addr.type === 1)}
            selectedAddress={selectedAddresses.billing}
            onSelectAddress={(address) => handleSelectAddress(address, 'billing')}
            showAddressSelector={true}
        />
        <CheckBox
            className="mt-4 mb-2 flex items-center whitespace-nowrap"
            defaultValue={watchReceiveUseBilling}
            id="receiveUseBilling"
            label="Use billing address as shipping address"
            {...register("receiveUseBilling")}
        />

        {/* 收货地址表单 */}
        <AddressFormSection
            type="receiver"
            config={ADDRESS_TYPE_CONFIG.receiver}
            register={register}
            control={control}
            errors={errors}
            isVisible={!watchReceiveUseBilling}
            savedAddresses={savedAddresses.filter(addr => addr.type === 2)}
            selectedAddress={selectedAddresses.receiver}
            onSelectAddress={(address) => handleSelectAddress(address, 'receiver')}
            showAddressSelector={!watchReceiveUseBilling}
        />

        <CheckBox
            className="mt-4 mb-2 flex-row items-center whitespace-nowrap"
            defaultValue={watchBusinessUseBilling}
            id="businessUseBilling"
            label="Use billing address as business address"
            {...register("businessUseBilling")}
        />

        {/* 商务地址表单 */}
        <AddressFormSection
            type="business"
            config={ADDRESS_TYPE_CONFIG.business}
            register={register}
            control={control}
            errors={errors}
            isVisible={!watchBusinessUseBilling}
            savedAddresses={savedAddresses.filter(addr => addr.type === 3)}
            selectedAddress={selectedAddresses.business}
            onSelectAddress={(address) => handleSelectAddress(address, 'business')}
            showAddressSelector={!watchBusinessUseBilling}
        />

        <div className="justify-self-end">
          <ProceedToCheckout buttonName="Next" pending={isLoadingToSave}/>
        </div>
      </form>
  );
};