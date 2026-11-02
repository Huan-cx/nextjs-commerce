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
import {useCustomToast} from "@utils/hooks/useToast";

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
  disableSummary?: boolean;  // ✅ 新增：禁用自动摘要模式
}

export const AddAddressForm: FC<AddAddressFormProps> = ({
                                                          autoNavigate = true,
                                                          onNextStep,
                                                          showButton = true,
                                                          disableSummary = false
                                                        }) => {
  const dispatch = useAppDispatch();
  const {showToast} = useCustomToast();
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

  const defaultFormValues = generateFormDefaultValues(
      billingAddress,
      receiverAddress,
      importerAddress,
      email,
      receiveUseBilling,
      importerUseBilling
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm({
    mode: "onChange",
    defaultValues: defaultFormValues,
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
    defaultValue: defaultFormValues,
  }) as CheckoutFormData;

  // 检查当前表单是否有效（考虑联动情况）
  const isFormValid = () => {
    // ✅ 添加非空检查
    if (!formValues || !formValues.billing || !formValues.receiver || !formValues.importer) {
      return false;
    }

    // 检查账单地址必填字段
    const billingValid = !!(
        formValues.billing.firstName &&
        formValues.billing.lastName &&
        formValues.billing.address &&
        formValues.billing.city &&
        formValues.billing.country &&
        formValues.billing.phone
    );

    // 如果没有勾选使用账单地址作为收货地址，检查收货地址
    const receiverValid = watchReceiveUseBilling || !!(
        formValues.receiver.firstName &&
        formValues.receiver.lastName &&
        formValues.receiver.address &&
        formValues.receiver.city &&
        formValues.receiver.country &&
        formValues.receiver.phone
    );

    // 如果没有勾选使用账单地址作为进口商地址，检查进口商地址
    const importerValid = watchImporterUseBilling || !!(
        formValues.importer.firstName &&
        formValues.importer.lastName &&
        formValues.importer.address &&
        formValues.importer.city &&
        formValues.importer.country &&
        formValues.importer.phone &&
        formValues.importer.companyName &&
        formValues.importer.vat
    );

    return billingValid && receiverValid && importerValid;
  };

  const addGuestAddress = useCallback(async (data: CheckoutFormData) => {
    const {billing, receiver, importer, receiveUseBilling, importerUseBilling} = data;

    // 验证数据
    if (!billing.firstName || !billing.lastName || !billing.address || !billing.city || !billing.country || !billing.phone) {
      showToast("Please fill in all required fields for billing address", "danger");
      return;
    }

    if (!receiveUseBilling && (!receiver.firstName || !receiver.lastName || !receiver.address || !receiver.city || !receiver.country || !receiver.phone)) {
      showToast("Please fill in all required fields for receiver address", "danger");
      return;
    }

    if (!importerUseBilling && (!importer.firstName || !importer.lastName || !importer.address || !importer.city || !importer.country || !importer.phone || !importer.companyName || !importer.vat)) {
      showToast("Please fill in all required fields for importer address", "danger");
      return;
    }

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
      showToast("Failed to save address", "danger");
    }
  }, [dispatch, router, autoNavigate, onNextStep, showToast]);

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

    // ✅ 添加非空检查
    if (!formValues || !formValues.billing || !formValues.receiver || !formValues.importer) {
      return;
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

    // ✅ 关键修复：选择地址时立即更新 Redux 状态
    if (address) {
      const addressData = createAddressData(address,
          type === 'billing' ? ADDRESS_TYPES.BILLING :
              type === 'receiver' ? ADDRESS_TYPES.RECEIVER : ADDRESS_TYPES.IMPORTER
      );

      if (type === 'billing') {
        dispatch(setBillingAddress(addressData));
        // 如果启用了联动，同时更新其他地址
        if (currentReceiveUseBilling) {
          dispatch(setReceiverAddress(addressData));
        }
        if (currentImporterUseBilling) {
          dispatch(setImporterAddress(addressData));
        }
        // ✅ 关键修复：当选择账单地址且启用联动时，更新 isOpen 状态以显示地址摘要
        if (currentReceiveUseBilling && currentImporterUseBilling) {
          setIsOpen(true);
        }
      } else if (type === 'receiver') {
        dispatch(setReceiverAddress(addressData));
        // ✅ 检查是否应该显示摘要
        if (isObject(billingAddress) && (isObject(importerAddress) || currentImporterUseBilling)) {
          setIsOpen(true);
        }
      } else if (type === 'importer') {
        dispatch(setImporterAddress(addressData));
        // ✅ 检查是否应该显示摘要
        if (isObject(billingAddress) && (isObject(receiverAddress) || currentReceiveUseBilling)) {
          setIsOpen(true);
        }
      }
    }
  }, [formValues, watchReceiveUseBilling, watchImporterUseBilling, email, reset, dispatch, billingAddress, receiverAddress, importerAddress]);

  const showSummary = !disableSummary && isObject(receiverAddress) && (isObject(billingAddress) || watchReceiveUseBilling) && (isObject(importerAddress) || watchImporterUseBilling);
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
              <ProceedToCheckout buttonName="Next" pending={isLoadingToSave} isDisabled={!isFormValid()}/>
            </div>
        )}
      </form>
  );
};