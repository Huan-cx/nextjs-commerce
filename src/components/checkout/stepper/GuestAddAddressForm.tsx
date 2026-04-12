"use client";
import {FC, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useForm, useWatch} from "react-hook-form";
import {IS_VALID_ADDRESS, IS_VALID_INPUT, IS_VALID_PHONE} from "@/utils/constants";
import {isObject} from "@/utils/type-guards";

import InputText from "@components/common/form/Input";
import {ProceedToCheckout} from "./ProceedToCheckout";
import CheckBox from "@components/theme/ui/element/Checkbox";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {
  setBillingAddress,
  setBusinessAddress,
  setReceiverAddress,
  toggleBusinessUseBilling,
  toggleReceiveUseBilling
} from "@/store/slices/checkout-slice";
import {Address} from "@/types/api/address/type";
import {useCheckout} from "@utils/hooks/useCheckout";
import CountrySelect from "@components/common/form/country";

// 可复用的地址显示组件
const AddressDisplay = ({
                          title,
                          address,
                          className = "",
                          showVat = false
                        }: {
  title: string;
  address: Address | null;
  className?: string;
  showVat?: boolean;
}) => (
    <div className={className}>
      <p className="w-[184px] text-base font-normal text-black/60 dark:text-white/60">
        {title}
      </p>
      <div className="block cursor-pointer rounded-xl p-2 max-sm:rounded-lg">
        <div className="flex flex-col">
          <p className="text-base font-medium">
            {`${address?.firstName || ""} ${address?.lastName || ""}`}
          </p>
          <p className="text-base font-medium text-zinc-500">
            {`${address?.companyName || ""}`}
          </p>
          {showVat && address?.vat && (
              <p className="text-sm text-zinc-500">
                VAT: {address.vat}
              </p>
          )}
        </div>
        <p className="mt-2 text-sm text-zinc-500 max-md:mt-2 max-sm:mt-0">
          {`${address?.address || ""}, ${address?.street || ""}, ${address?.postcode || ""}`}
        </p>
        <p className="text-zinc-500">
          {address?.city || ""} {address?.state || ""},
          {address?.country || ""}
        </p>
        <p className="mt-2 text-sm text-zinc-500 max-md:mt-2 max-sm:mt-0">
          {`T: ${address?.phone || ""}`}
        </p>
      </div>
    </div>
);

export const GuestAddAddressForm: FC = () => {
  const dispatch = useAppDispatch();
  const {
    billingAddress,
    receiverAddress,
    businessAddress,
    receiveUseBilling,
    businessUseBilling,
    email,
  } = useAppSelector((state) => state.checkout);

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
    defaultValues: {
      billing: {
        email: billingAddress?.email ?? email ?? "",
        firstName: billingAddress?.firstName || "",
        lastName: billingAddress?.lastName || "",
        companyName: billingAddress?.companyName || "",
        address: billingAddress?.address || "",
        street: billingAddress?.street || "",
        country: billingAddress?.country || "",
        state: billingAddress?.state || "",
        city: billingAddress?.city || "",
        postcode: billingAddress?.postcode || "",
        phone: billingAddress?.phone || "",
        vat: billingAddress?.vat || "",
        eori: billingAddress?.eori || "",
      },
      receiver: {
        email: receiverAddress?.email ?? email ?? "",
        firstName: receiverAddress?.firstName || "",
        lastName: receiverAddress?.lastName || "",
        companyName: receiverAddress?.companyName || "",
        address: receiverAddress?.address || "",
        street: receiverAddress?.street || "",
        country: receiverAddress?.country || "",
        state: receiverAddress?.state || "",
        city: receiverAddress?.city || "",
        postcode: receiverAddress?.postcode || "",
        phone: receiverAddress?.phone || "",
        vat: receiverAddress?.vat || "",
        eori: receiverAddress?.eori || "",
      },
      business: {
        email: businessAddress?.email ?? email ?? "",
        firstName: businessAddress?.firstName || "",
        lastName: businessAddress?.lastName || "",
        companyName: businessAddress?.companyName || "",
        address: businessAddress?.address || "",
        street: businessAddress?.street || "",
        country: businessAddress?.country || "",
        state: businessAddress?.state || "",
        city: businessAddress?.city || "",
        postcode: businessAddress?.postcode || "",
        phone: businessAddress?.phone || "",
        vat: businessAddress?.vat || "",
        eori: businessAddress?.eori || "",
      },
      receiveUseBilling: receiveUseBilling,
      businessUseBilling: businessUseBilling,
    },
  });

  useEffect(() => {
    reset({
      billing: {
        email: billingAddress?.email ?? email ?? "",
        firstName: billingAddress?.firstName || "",
        lastName: billingAddress?.lastName || "",
        companyName: billingAddress?.companyName || "",
        address: billingAddress?.address || "",
        street: billingAddress?.street || "",
        country: billingAddress?.country || "",
        state: billingAddress?.state || "",
        city: billingAddress?.city || "",
        postcode: billingAddress?.postcode || "",
        phone: billingAddress?.phone || "",
        vat: billingAddress?.vat || "",
        eori: billingAddress?.eori || "",
      },
      receiver: {
        email: receiverAddress?.email ?? email ?? "",
        firstName: receiverAddress?.firstName || "",
        lastName: receiverAddress?.lastName || "",
        companyName: receiverAddress?.companyName || "",
        address: receiverAddress?.address || "",
        street: receiverAddress?.street || "",
        country: receiverAddress?.country || "",
        state: receiverAddress?.state || "",
        city: receiverAddress?.city || "",
        postcode: receiverAddress?.postcode || "",
        phone: receiverAddress?.phone || "",
        vat: receiverAddress?.vat || "",
        eori: receiverAddress?.eori || "",
      },
      business: {
        email: businessAddress?.email ?? email ?? "",
        firstName: businessAddress?.firstName || "",
        lastName: businessAddress?.lastName || "",
        companyName: businessAddress?.companyName || "",
        address: businessAddress?.address || "",
        street: businessAddress?.street || "",
        country: businessAddress?.country || "",
        state: businessAddress?.state || "",
        city: businessAddress?.city || "",
        postcode: businessAddress?.postcode || "",
        phone: businessAddress?.phone || "",
        vat: businessAddress?.vat || "",
        eori: businessAddress?.eori || "",
      },
      receiveUseBilling: receiveUseBilling,
      businessUseBilling: businessUseBilling,
    });
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

  const addGuestAddress = async (data: any) => {
    const {billing, receiver, business, receiveUseBilling, businessUseBilling} = data;

    const receiverSource = receiveUseBilling ? billing : receiver;
    const businessSource = businessUseBilling ? billing : business;

    const billingAddressData = {
      ...billing,
      email: billing.email ?? email ?? "",
      id: 0,
      defaultStatus: true,
      type: 1, // 账单地址
    } as Address;

    const receiverAddressData = {
      ...receiverSource,
      email: receiverSource.email ?? email ?? "",
      id: 0,
      defaultStatus: true,
      type: 2, // 收货地址
    } as Address;

    const businessAddressData = {
      ...businessSource,
      email: businessSource.email ?? email ?? "",
      id: 0,
      defaultStatus: true,
      type: 3, // 商业地址
    } as Address;

    try {
      // 更新 Redux 状态
      dispatch(setBillingAddress(billingAddressData));
      dispatch(setReceiverAddress(receiverAddressData));
      dispatch(setBusinessAddress(businessAddressData));
      dispatch(toggleReceiveUseBilling(receiveUseBilling));
      dispatch(toggleBusinessUseBilling(businessUseBilling));

      // 跳转到配送方式选择步骤
      router.replace("/checkout?step=shipping");
    } catch (error) {
      console.error("Failed to save checkout address", error);
    }
  };

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
        <div className="my-7 grid grid-cols-6 gap-4">
          <InputText
              {...register("billing.firstName", {
                required: "First name is required",
                pattern: {
                  value: IS_VALID_INPUT,
                  message: "Invalid First Name",
                },
              })}
              className="col-span-6 xxs:col-span-3 mb-4"
              errorMsg={errors?.billing?.firstName?.message}
              label="First Name"
              size="md"
          />
          <InputText
              {...register("billing.lastName", {
                required: "Last name is required",
                pattern: {
                  value: IS_VALID_INPUT,
                  message: "Invalid Last Name",
                },
              })}
              className="col-span-6 xxs:col-span-3 mb-4"
              errorMsg={errors?.billing?.lastName?.message}
              label="Last Name"
              size="md"
          />
          <InputText
              {...register("billing.companyName", {
                pattern: {
                  value: IS_VALID_INPUT,
                  message: "Invalid Company Name",
                },
              })}
              className="col-span-6 mb-2"
              errorMsg={errors?.billing?.companyName?.message}
              label="Company Name"
              size="md"
          />
          <InputText
              {...register("billing.vat", {
                pattern: {
                  value: IS_VALID_INPUT,
                  message: "Invalid VAT",
                },
              })}
              className="col-span-6 mb-2"
              errorMsg={errors?.billing?.vat?.message}
              label="VAT"
              size="md"
          />
          <InputText
              {...register("billing.eori", {
                pattern: {
                  value: IS_VALID_INPUT,
                  message: "Invalid EORI",
                },
              })}
              className="col-span-6 mb-2"
              errorMsg={errors?.billing?.eori?.message}
              label="EORI"
              size="md"
          />
          <InputText
              {...register("billing.address", {
                required: "Address field is required",
                pattern: {
                  value: IS_VALID_ADDRESS,
                  message: "Invalid Address",
                },
              })}
              className="col-span-6 mb-4"
              errorMsg={errors?.billing?.address?.message}
              label="Address"
              size="md"
          />
          <InputText
              {...register("billing.street", {
                required: "Street field is required",
                pattern: {
                  value: IS_VALID_ADDRESS,
                  message: "Invalid Street",
                },
              })}
              className="col-span-6 mb-4"
              errorMsg={errors?.billing?.street?.message}
              label="Street"
              size="md"
          />
          <CountrySelect
              control={control}
              name="billing.country"
              label="Country"
              required
              errorMsg={errors?.billing?.country?.message}
              className="col-span-6 xxs:col-span-3 mb-4"
          />
          <InputText
              {...register("billing.state", {
                required: "State field is required",
                pattern: {
                  value: IS_VALID_INPUT,
                  message: "Invalid State",
                },
              })}
              className="col-span-6 xxs:col-span-3 mb-4"
              errorMsg={errors?.billing?.state?.message}
              label="State"
              size="md"
          />
          <InputText
              {...register("billing.city", {
                required: "City field is required",
                pattern: {
                  value: IS_VALID_INPUT,
                  message: "Invalid City",
                },
              })}
              className="col-span-6 xxs:col-span-3 mb-4"
              errorMsg={errors?.billing?.city?.message}
              label="City"
              size="md"
          />
          <InputText
              {...register("billing.postcode", {
                required: "Postcode field is required",
                pattern: {
                  value: IS_VALID_INPUT,
                  message: "Invalid Postcode",
                },
              })}
              className="col-span-6 xxs:col-span-3"
              errorMsg={errors?.billing?.postcode?.message}
              label="Zip Code"
              size="md"
          />
          <InputText
              {...register("billing.phone", {
                required: "Phone field is required",
                pattern: {
                  value: IS_VALID_PHONE,
                  message: "Enter Valid Phone Number",
                },
              })}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="col-span-6"
              errorMsg={errors?.billing?.phone?.message}
              label="Phone"
              size="md"
          />
          <CheckBox
              className="col-span-6 mt-3"
              defaultValue={watchReceiveUseBilling}
              id="receiveUseBilling"
              label="Use billing address as shipping address"
              {...register("receiveUseBilling")}
          />
        </div>

        {!watchReceiveUseBilling && (
            <div className="my-7 grid grid-cols-6 gap-4">
              <InputText
                  {...register("receiver.firstName", {
                    required: "First name is required",
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid First Name",
                    },
                  })}
                  className="col-span-3 mb-4"
                  errorMsg={errors?.receiver?.firstName?.message}
                  label="First Name"
                  size="md"
              />
              <InputText
                  {...register("receiver.lastName", {
                    required: "Last name is required",
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid Last Name",
                    },
                  })}
                  className="col-span-3 mb-4"
                  errorMsg={errors?.receiver?.lastName?.message}
                  label="Last Name"
                  size="md"
              />
              <InputText
                  {...register("receiver.companyName", {
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid Company Name",
                    },
                  })}
                  className="col-span-6 mb-4"
                  errorMsg={errors?.receiver?.companyName?.message}
                  label="Company Name"
                  size="md"
              />
              <InputText
                  {...register("receiver.vat", {
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid VAT",
                    },
                  })}
                  className="col-span-6 mb-2"
                  errorMsg={errors?.receiver?.vat?.message}
                  label="VAT"
                  size="md"
              />
              <InputText
                  {...register("receiver.eori", {
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid EORI",
                    },
                  })}
                  className="col-span-6 mb-2"
                  errorMsg={errors?.receiver?.eori?.message}
                  label="EORI"
                  size="md"
              />
              <InputText
                  {...register("receiver.address", {
                    required: "Address field is required",
                    pattern: {
                      value: IS_VALID_ADDRESS,
                      message: "Invalid Address",
                    },
                  })}
                  className="col-span-6 mb-4"
                  errorMsg={errors?.receiver?.address?.message}
                  label="Address"
                  size="md"
              />
              <InputText
                  {...register("receiver.street", {
                    required: "Street field is required",
                    pattern: {
                      value: IS_VALID_ADDRESS,
                      message: "Invalid Street",
                    },
                  })}
                  className="col-span-6 mb-4"
                  errorMsg={errors?.receiver?.street?.message}
                  label="Street"
                  size="md"
              />
              <CountrySelect
                  control={control}
                  name="receiver.country"
                  label="Country"
                  required
                  errorMsg={errors?.receiver?.country?.message}
                  className="col-span-6 xxs:col-span-3 mb-4"
              />
              <InputText
                  {...register("receiver.state", {
                    required: "State field is required",
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid State",
                    },
                  })}
                  className="col-span-6 xxs:col-span-3 mb-4"
                  errorMsg={errors?.receiver?.state?.message}
                  label="State"
                  size="md"
              />
              <InputText
                  {...register("receiver.city", {
                    required: "City field is required",
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid City",
                    },
                  })}
                  className="col-span-3 mb-4"
                  errorMsg={errors?.receiver?.city?.message}
                  label="City"
                  size="md"
              />
              <InputText
                  {...register("receiver.postcode", {
                    required: "Postcode field is required",
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid Postcode",
                    },
                  })}
                  className="col-span-3"
                  errorMsg={errors?.receiver?.postcode?.message}
                  label="Zip Code"
                  size="md"
              />
              <InputText
                  {...register("receiver.phone", {
                    required: "Phone field is required",
                    pattern: {
                      value: IS_VALID_PHONE,
                      message: "Enter Valid Phone Number",
                    },
                  })}
                  className="col-span-6"
                  errorMsg={errors?.receiver?.phone?.message}
                  label="Phone"
                  size="md"
              />
            </div>
        )}


        <CheckBox
            className="col-span-6 mt-3"
            defaultValue={watchBusinessUseBilling}
            id="businessUseBilling"
            label="Use billing address as business address"
            {...register("businessUseBilling")}
        />

        {/* Business Address Form */}
        {!watchBusinessUseBilling && (
            <div className="my-7 grid grid-cols-6 gap-4">
              <h3 className="col-span-6 text-lg font-medium mb-4">Business Address</h3>
              <InputText
                  {...register("business.firstName", {
                    required: "First name is required",
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid First Name",
                    },
                  })}
                  className="col-span-6 xxs:col-span-3 mb-4"
                  errorMsg={errors?.business?.firstName?.message}
                  label="First Name"
                  size="md"
              />
              <InputText
                  {...register("business.lastName", {
                    required: "Last name is required",
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid Last Name",
                    },
                  })}
                  className="col-span-6 xxs:col-span-3 mb-4"
                  errorMsg={errors?.business?.lastName?.message}
                  label="Last Name"
                  size="md"
              />
              <InputText
                  {...register("business.companyName", {
                    required: "Company Name is required",
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid Company Name",
                    },
                  })}
                  className="col-span-6 mb-2"
                  errorMsg={errors?.business?.companyName?.message}
                  label="Company Name"
                  size="md"
              />
              <InputText
                  {...register("business.vat", {
                    required: "VAT is required",
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid VAT",
                    },
                  })}
                  className="col-span-6 mb-2"
                  errorMsg={errors?.business?.vat?.message}
                  label="VAT"
                  size="md"
              />
              <InputText
                  {...register("business.eori", {
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid EORI",
                    },
                  })}
                  className="col-span-6 mb-2"
                  errorMsg={errors?.business?.eori?.message}
                  label="EORI"
                  size="md"
              />
              <InputText
                  {...register("business.address", {
                    required: "Address field is required",
                    pattern: {
                      value: IS_VALID_ADDRESS,
                      message: "Invalid Address",
                    },
                  })}
                  className="col-span-6 mb-4"
                  errorMsg={errors?.business?.address?.message}
                  label="Address"
                  size="md"
              />
              <InputText
                  {...register("business.street", {
                    required: "Street field is required",
                    pattern: {
                      value: IS_VALID_ADDRESS,
                      message: "Invalid Street",
                    },
                  })}
                  className="col-span-6 mb-4"
                  errorMsg={errors?.business?.street?.message}
                  label="Street"
                  size="md"
              />
              <CountrySelect
                  control={control}
                  name="business.country"
                  label="Country"
                  required
                  errorMsg={errors?.business?.country?.message}
                  className="col-span-6 xxs:col-span-3 mb-4"
              />
              <InputText
                  {...register("business.state", {
                    required: "State field is required",
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid State",
                    },
                  })}
                  className="col-span-6 xxs:col-span-3 mb-4"
                  errorMsg={errors?.business?.state?.message}
                  label="State"
                  size="md"
              />
              <InputText
                  {...register("business.city", {
                    required: "City field is required",
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid City",
                    },
                  })}
                  className="col-span-6 xxs:col-span-3 mb-4"
                  errorMsg={errors?.business?.city?.message}
                  label="City"
                  size="md"
              />
              <InputText
                  {...register("business.postcode", {
                    required: "Postcode field is required",
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid Postcode",
                    },
                  })}
                  className="col-span-6 xxs:col-span-3"
                  errorMsg={errors?.business?.postcode?.message}
                  label="Zip Code"
                  size="md"
              />
              <InputText
                  {...register("business.phone", {
                    required: "Phone field is required",
                    pattern: {
                      value: IS_VALID_PHONE,
                      message: "Enter Valid Phone Number",
                    },
                  })}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className="col-span-6"
                  errorMsg={errors?.business?.phone?.message}
                  label="Phone"
                  size="md"
              />
            </div>
        )}

        <div className="justify-self-end">
          <ProceedToCheckout buttonName="Next" pending={isLoadingToSave}/>
        </div>
      </form>
  );
};