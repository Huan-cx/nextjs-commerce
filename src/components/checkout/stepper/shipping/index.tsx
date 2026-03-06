"use client";

import { CartCheckoutPageSkeleton } from "@/components/common/skeleton/CheckoutSkeleton";
import { useQuery } from "@apollo/client";
import ShippingMethod from "./ShippingMethod";
import { FC } from "react";
import { SelectedShippingRateType } from "@/types/checkout/type";
import { GET_CHECKOUT_SHIPPING_RATES } from "@/graphql";
import { getCartToken } from "@/utils/getCartToken";

const Shipping: FC<{
  selectedShippingRate?: SelectedShippingRateType;
  currentStep?: string;
}> = ({ selectedShippingRate, currentStep }) => {
  const token = getCartToken();

  const { data, loading: isLoading } = useQuery(GET_CHECKOUT_SHIPPING_RATES, {
    variables: { token: token || "" },
    skip: !token,
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  if (isLoading && !data) {
    return <CartCheckoutPageSkeleton />;
  }
  return (
    <ShippingMethod
      shippingMethod={data?.collectionShippingRates}
      selectedShippingRate={selectedShippingRate}
      methodDesc={selectedShippingRate?.methodDescription}
      currentStep={currentStep}
    />
  );
};

export default Shipping;
