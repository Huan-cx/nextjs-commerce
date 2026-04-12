"use client";

import {CartCheckoutPageSkeleton} from "@/components/common/skeleton/CheckoutSkeleton";
import PaymentMethod from "./PaymentMethod";
import {FC} from "react";
import {getPaymentChannels} from "@/utils/api/trade";
import {useQuery} from "@tanstack/react-query";

const Payment: FC<{
  currentStep?: string;
}> = ({currentStep}) => {
  const {data: methods = [], isLoading} = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: () => getPaymentChannels({appId: "1"}),
  });

  if (isLoading) return <CartCheckoutPageSkeleton/>;

  return (
    <PaymentMethod
        methods={methods}
      currentStep={currentStep}
    />
  );
};

export default Payment;