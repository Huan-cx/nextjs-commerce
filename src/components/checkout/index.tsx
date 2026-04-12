"use client";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import CheckoutCart from "./checkout-cart/CheckoutCart";
import Stepper from "./stepper";
import {useScrollToTop} from "@/utils/hooks/useScrollTo";
import {useEffect} from "react";
import {fetchOrderSettlement} from "@/store/slices/checkout-slice";

interface CheckOutProps {
  step: string;
}

const CheckOut = ({ step }: CheckOutProps) => {
  const dispatch = useAppDispatch();
  const cartDetail = useAppSelector((state) => state.cartDetail);
  const {
    settlementData,
    receiverAddress,
    couponId,
    pointStatus,
  } = useAppSelector((state) => state.checkout);

  useScrollToTop();

  useEffect(() => {
    // Precondition check: Only fetch settlement data if a delivery address is selected.
    if (step === 'review' && receiverAddress) {
      dispatch(fetchOrderSettlement());
    }
  }, [dispatch, step, receiverAddress, couponId, pointStatus]);


  return (
    <>
      <section className="flex flex-col items-start justify-between lg:flex-row lg:justify-between">
        <div className="w-full px-0 py-2 sm:px-4 sm:py-4 lg:w-1/2 xl:pl-16 xl:pr-0">
          <Stepper
              settlementData={settlementData}
              currentStep={step}
          />
        </div>

        <div className="h-full w-full !z-0 justify-self-start border-0 border-l border-none border-black/[10%] dark:border-neutral-700 lg:w-1/2 lg:border-solid">
          <div className="max-h-auto w-full flex-initial flex-shrink-0 flex-grow-0 lg:sticky lg:top-0">
            <CheckoutCart
                cartItems={cartDetail?.cart}
                settlementData={settlementData}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default CheckOut;