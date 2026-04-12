"use client";

import {CartCheckoutPageSkeleton} from "@/components/common/skeleton/CheckoutSkeleton";
import ShippingMethod from "./ShippingMethod";
import {FC} from "react";
import {getShippingChannels} from "@/utils/api/trade";
import {useQuery} from "@tanstack/react-query";

const Shipping: FC<{
  currentStep?: string;
}> = ({currentStep}) => {
  const {data: shippingMethod = [], isLoading: isLoadingMethods} = useQuery({
    queryKey: ["shippingMethods"],
    queryFn: getShippingChannels,
  });

  if (isLoadingMethods) {
    return <CartCheckoutPageSkeleton />;
  }
  return (
    <ShippingMethod
        shippingMethod={shippingMethod}
      currentStep={currentStep}
    />
  );
};

export default Shipping;