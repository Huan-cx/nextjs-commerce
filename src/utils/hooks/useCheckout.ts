import {useRouter} from "next/navigation";
import {useCustomToast} from "./useToast";
import {setCookie} from "@utils/helper";
import {ORDER_ID} from "@utils/constants";

import {useState} from "react";
import {submitOrder} from "@/utils/api/trade";
import {useAppSelector} from "@/store/hooks";

export const useCheckout = () => {
  const router = useRouter()// const { resetGuestToken } = useGuestCartToken();
  const { showToast } = useCustomToast();
  const [isLoadingToSave] = useState(false);
  const [isPlaceOrder, setIsPlaceOrder] = useState(false);

  // 从 Redux 中获取地址和支付/配送方式
  const cartState = useAppSelector((state) => state.cartDetail);
  const checkoutState = useAppSelector((state) => state.checkout);

  const savePlaceOrder = async () => {
    setIsPlaceOrder(true);
    try {
      const {cart} = cartState;
      const {
        billingAddress,
        receiverAddress,
        businessAddress,
        receiveUseBilling,
        businessUseBilling,
        paymentMethod,
        deliveryType,
        pointStatus,
        couponId,
      } = checkoutState;

      // 提交订单 - 使用原始地址数据
      const orderData = await submitOrder({
        billingAddress: billingAddress,
        receiverAddress: receiverAddress,
        businessAddress: businessAddress,
        receiveUseBilling: receiveUseBilling,
        businessUseBilling: businessUseBilling,
        paymentMethod: paymentMethod,
        deliveryType: deliveryType,
        pointStatus: pointStatus,
        couponId: couponId,
        remark: "",
        items: cart?.items.map((item) => ({
          skuId: item.sku.id,
          cartId: item.id,
          count: item.count,
        })) || [],
      });
      if (orderData?.payOrderId) {
        showToast("Order placed successfully!", "success");
        setCookie(ORDER_ID, orderData.payOrderId);

        // 跳转到成功页面
        router.replace("/success");
        // TODO: 清空购物车? 这里AI排查说会导致SKU 被清空，是否需要处理?
        // const isGuest = getCookie(IS_GUEST);
        // if (isGuest === "true") {
        //   await resetGuestToken();
        // }
      } else {
        showToast("Failed to place order", "warning");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      showToast("Failed to place order", "danger");
    } finally {
      setIsPlaceOrder(false);
    }
  };

  return {
    isLoadingToSave,
    isPlaceOrder,
    savePlaceOrder,
  };
};