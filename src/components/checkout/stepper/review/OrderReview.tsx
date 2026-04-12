"use client";
import {useForm} from "react-hook-form";
import {useCheckout} from "@utils/hooks/useCheckout";
import {ProceedToCheckout} from "../ProceedToCheckout";
import {getPaymentChannels, getShippingChannels, OrderSettlement} from "@utils/api/trade";
import {useAppSelector} from "@/store/hooks";
import {useQuery} from "@tanstack/react-query";

export default function OrderReview({
                                      settlementData,
}: {
  settlementData?: OrderSettlement | null;
}) {

  const { isPlaceOrder, savePlaceOrder } = useCheckout();
  const { handleSubmit } = useForm();
  const {
    receiverAddress,
    billingAddress,
    businessAddress,
    deliveryType,
    paymentMethod
  } = useAppSelector(state => state.checkout);

  const {data: shippingChannels = []} = useQuery({
    queryKey: ["shippingMethods"],
    queryFn: getShippingChannels,
  });

  const {data: paymentChannels = []} = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: () => getPaymentChannels({appId: "1"}),
  });

  const selectedShipping = shippingChannels.find(s => s.id === deliveryType);
  const selectedPayment = paymentChannels.find(p => p.id === paymentMethod);

  const onSubmit = () => {
    savePlaceOrder();
  };
  if (!settlementData) {
    return (
        <div className="mt-4 flex justify-center items-center">
          <p>Loading order summary...</p>
        </div>
    );
  }

  return (
      <div className="mt-4 flex-col mb-20 sm:mb-0">
        {/* Items Review */}
        {/*<div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          <table className="w-full text-left text-sm">
            <thead className="text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Product</th>
              <th scope="col" className="px-6 py-3">Quantity</th>
              <th scope="col" className="px-6 py-3">Price</th>
              <th scope="col" className="px-6 py-3">Total</th>
            </tr>
            </thead>
            <tbody>
            {settlementData.items.map(item => (
                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {item.spu.name}
                    <div className="text-xs text-gray-500">
                      {item.sku.properties.map(p => `${p.propertyName}: ${p.valueName}`).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4">{item.count}</td>
                  <td className="px-6 py-4">
                    <Price amount={String(item.sku.price / 100)} currencyCode={currencyCode} />
                  </td>
                  <td className="px-6 py-4">
                    <Price amount={String((item.sku.price * item.count) / 100)} currencyCode={currencyCode} />
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>*/}

        {/* Address and Method Review */}
        <div className="relative mb-6">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <tbody>
            <tr className="">
              <td className="py-2">Contact</td>
              <th className="break-all px-6 py-2 font-medium text-gray-900 dark:text-white" scope="row">
                {receiverAddress?.email}
              </th>
            </tr>
            <tr className="">
              <td className="py-2">Billing to</td>
              <th className="break-all px-6 py-2 font-medium text-gray-900 dark:text-white" scope="row">
                {billingAddress?.firstName}, {billingAddress?.lastName}, {billingAddress?.address}, {billingAddress?.city}, {billingAddress?.state}, {billingAddress?.postcode}, {billingAddress?.country}
              </th>
            </tr>
            <tr className="">
              <td className="py-2">Ship to</td>
              <th className="break-all px-6 py-2 font-medium text-gray-900 dark:text-white" scope="row">
                {receiverAddress?.firstName}, {receiverAddress?.lastName}, {receiverAddress?.address}, {receiverAddress?.city}, {receiverAddress?.state}, {receiverAddress?.postcode}, {receiverAddress?.country}
              </th>
            </tr>
            {businessAddress && (
                <tr className="">
                  <td className="py-2">Business Address</td>
                  <th className="break-all px-6 py-2 font-medium text-gray-900 dark:text-white" scope="row">
                    {businessAddress?.firstName}, {businessAddress?.lastName}, {businessAddress?.address}, {businessAddress?.city}, {businessAddress?.state}, {businessAddress?.postcode}, {businessAddress?.country}
                  </th>
                </tr>
            )}
            <tr className="">
              <td className="py-2">Method</td>
              <th className="break-all px-6 py-2 font-medium text-gray-900 dark:text-white" scope="row">
                {selectedShipping?.name}
              </th>
            </tr>
            <tr className="">
              <td className="py-2">Payment</td>
              <th className="break-all px-6 py-2 font-medium text-gray-900 dark:text-white" scope="row">
                {selectedPayment?.name}
              </th>
            </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="justify-self-end">
              <ProceedToCheckout
                  buttonName="Place Order"
                  pending={isPlaceOrder}
              />
            </div>
          </form>
        </div>
      </div>
  );
}