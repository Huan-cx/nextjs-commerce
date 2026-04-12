"use client";

import {useRestMutation} from "@utils/hooks/useCustomMutation";
import {useCartDetail} from "@utils/hooks/useCartDetail";
import {useAppSelector} from "@/store/hooks";
import {MergeCartRequest} from "@utils/api/trade";

export function useMergeCart() {
  const {getCartDetail} = useCartDetail();
  const cartItems = useAppSelector((state) => state.cartDetail.cart?.items);

  const [mutation, {loading: isLoading}] = useRestMutation(
      "trade/cart/merge",
      {
        method: "POST",
        onCompleted: (success: boolean) => {
          if (success) {
            // 合并成功后，强制重新获取购物车详情，以同步服务端最新数据
            getCartDetail(true);
          }
        },
        onError: (_error: any) => {
          console.error("Failed to merge cart:", _error);
        },
      }
  );

  const mergeCart = async () => {
    if (!cartItems || cartItems.length === 0) {
      console.log("No items to merge.");
      return;
    }

    const payload: MergeCartRequest = {
      items: cartItems.map((item) => ({
        skuId: item.sku.id,
        count: item.count,
      })),
    };

    await mutation(payload);
  };

  return {
    mergeCart,
    isLoading,
  };
}