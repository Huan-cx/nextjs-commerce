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
  setImporterAddress,
  setReceiverAddress,
  toggleImporterUseBilling,
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
  IMPORTER: 3,
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
  importer: {
    title: "Importer Address",
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
    importerAddress: AddressLine | null,
    email: string | null,
    receiveUseBilling: boolean,
    importerUseBilling: boolean
): CheckoutFormData => ({
  billing: createAddressFormData(billingAddress, email),
  receiver: createAddressFormData(receiverAddress, email),
  importer: createAddressFormData(importerAddress, email),
  receiveUseBilling,
  importerUseBilling,
});


interface AddAddressFormProps {
  autoNavigate?: boolean;
  onNextStep?: () => void;
  showButton?: boolean;
}

export const AddAddressForm: FC<AddAddressFormProps> = ({autoNavigate = true, onNextStep, showButton = true}) => {
  const dispatch = useAppDispatch();
  const {
    billingAddress,
    receiverAddress,
    importerAddress,
    receiveUseBilling,
    importerUseBilling,
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
    importer: null,
  });

  const [isOpen, setIsOpen] = useState(
      isObject(receiverAddress) && isObject(billingAddress) && isObject(importerAddress)
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
        importerAddress,
        email,
        receiveUseBilling,
        importerUseBilling
    ),
  });

  useEffect(() => {
    reset(generateFormDefaultValues(
        billingAddress,
        receiverAddress,
        importerAddress,
        email,
        receiveUseBilling,
        importerUseBilling
    ));
  }, [billingAddress, receiverAddress, importerAddress, reset, email, receiveUseBilling, importerUseBilling]);
  const {isLoadingToSave} = useCheckout();
  const router = useRouter();

  const watchReceiveUseBilling = useWatch({
    control,
    name: "receiveUseBilling",
    defaultValue: receiveUseBilling,
  });

  const watchImporterUseBilling = useWatch({
    control,
    name: "importerUseBilling",
    defaultValue: importerUseBilling,
  });

  const formValues = useWatch({
    control,
    defaultValue: {
      billing: createAddressFormData(billingAddress, email),
      receiver: createAddressFormData(receiverAddress, email),
      importer: createAddressFormData(importerAddress, email),
      receiveUseBilling,
      importerUseBilling,
    },
  });

  const addGuestAddress = useCallback(async (data: CheckoutFormData) => {
    const {billing, receiver, importer, receiveUseBilling, importerUseBilling} = data;

    const receiverSource = receiveUseBilling ? billing : receiver;
    const importerSource = importerUseBilling ? billing : importer;

    try {
      dispatch(setBillingAddress(createAddressData(billing, ADDRESS_TYPES.BILLING)));
      dispatch(setReceiverAddress(createAddressData(receiverSource, ADDRESS_TYPES.RECEIVER)));
      dispatch(setImporterAddress(createAddressData(importerSource, ADDRESS_TYPES.IMPORTER)));
      dispatch(toggleReceiveUseBilling(receiveUseBilling));
      dispatch(toggleImporterUseBilling(importerUseBilling));

      if (autoNavigate) {
        router.replace("/checkout?step=shipping");
      } else if (onNextStep) {
        onNextStep();
      }
    } catch (error) {
      console.error("Failed to save checkout address", error);
    }
  }, [dispatch, router, autoNavigate, onNextStep]);

  const handleSelectAddress = useCallback((address: AddressLine | null, type: AddressType) => {
    const currentReceiveUseBilling = watchReceiveUseBilling;
    const currentImporterUseBilling = watchImporterUseBilling;

    // 更新选中状态
    setSelectedAddresses(prev => ({...prev, [type]: address}));

    // 如果是账单地址且启用了联动，清空其他选中状态
    if (type === 'billing') {
      if (currentReceiveUseBilling) {
        setSelectedAddresses(prev => ({...prev, receiver: null}));
      }
      if (currentImporterUseBilling) {
        setSelectedAddresses(prev => ({...prev, importer: null}));
      }
    }

    // 生成新的表单数据
    const newFormData = {
      billing: formValues.billing,
      receiver: formValues.receiver,
      importer: formValues.importer,
      receiveUseBilling: currentReceiveUseBilling,
      importerUseBilling: currentImporterUseBilling,
    };

    // 更新对应类型的地址数据
    newFormData[type] = address ? createAddressFormData(address, email) : createAddressFormData(null, email);

    reset(newFormData);
  }, [formValues, watchReceiveUseBilling, watchImporterUseBilling, email, reset]);

  const showSummary = isObject(receiverAddress) && (isObject(billingAddress) || watchReceiveUseBilling) && (isObject(importerAddress) || watchImporterUseBilling);
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
                  title="Importer Address"
                  address={importerAddress}
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
                  title="Importer Address"
                  address={importerAddress}
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
            defaultValue={watchImporterUseBilling}
            id="importerUseBilling"
            label="Use billing address as importer address"
            {...register("importerUseBilling")}
        />

        {/* 进口商地址表单 */}
        <AddressFormSection
            type="importer"
            config={ADDRESS_TYPE_CONFIG.importer}
            register={register}
            control={control}
            errors={errors}
            isVisible={!watchImporterUseBilling}
            savedAddresses={savedAddresses.filter(addr => addr.type === 3)}
            selectedAddress={selectedAddresses.importer}
            onSelectAddress={(address) => handleSelectAddress(address, 'importer')}
            showAddressSelector={!watchImporterUseBilling}
        />

        {showButton && (
            <div className="justify-self-end">
              <ProceedToCheckout buttonName="Next" pending={isLoadingToSave}/>
            </div>
        )}
      </form>
  );
};