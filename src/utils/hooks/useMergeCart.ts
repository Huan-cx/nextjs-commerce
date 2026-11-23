"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useAppSelector} from "@/store/hooks";
import {mergeCart, MergeCartRequest} from "@utils/api/trade";
import {useCustomToast} from "./useToast";
import {useTranslations} from "next-intl";

export function useMergeCart() {
  const queryClient = useQueryClient();
  const cartItems = useAppSelector((state) => state.cartDetail.cart?.items);
  const {showToast} = useCustomToast();
  const t = useTranslations("cart");

  const {mutateAsync: mergeCartMutation, isPending: isLoading} = useMutation({
    mutationFn: (payload: MergeCartRequest) => mergeCart(payload),
    onSuccess: () => {
      // On successful merge, invalidate the cart query to refetch the latest cart data.
      queryClient.invalidateQueries({queryKey: ['cart']});
      showToast(t("mergedSuccess"), "success");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to merge cart";
      showToast(message, "danger");
      console.error("Failed to merge cart:", error);
    },
  });

  const handleMergeCart = async () => {
    if (!cartItems || cartItems.length === 0) {
      return;
    }

    const payload: MergeCartRequest = {
      items: cartItems.map((item) => ({
        skuId: item.sku.id,
        count: item.count,
      })),
    };

    await mergeCartMutation(payload);
  };

  return {
    mergeCart: handleMergeCart,
    isLoading,
  };
}