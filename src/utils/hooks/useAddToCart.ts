// src/utils/hooks/useAddToCart.ts
import {useCallback} from "react";
import {useCustomToast} from "./useToast";
import {useAppDispatch} from "@/store/hooks";
import {addItem, clearCart} from "@/store/slices/cart-slice";
import {getCartToken} from "@utils/getCartToken";
import {useGuestCartToken} from "./useGuestCartToken";
import {useRestMutation} from "@utils/hooks/useCustomMutation";
import {getCartInfo} from "@utils/api/cart";

export const useAddProduct = () => {
  const dispatch = useAppDispatch();
  const { createGuestToken, resetGuestToken } = useGuestCartToken();
  const { showToast } = useCustomToast();

  // 通用的购物车操作成功处理函数
  const handleCartSuccess = useCallback(async (
      successMessage: string,
      warningMessage: string,
      checkEmptyCart: boolean = false
  ) => {
    try {
      const cartInfo = await getCartInfo();
      dispatch(addItem(cartInfo));
      showToast(successMessage, "success");

      // 检查购物车是否为空
      if (checkEmptyCart && !cartInfo?.itemsQty) {
        dispatch(clearCart());
        // TODO  清空购物车? 这里AI排查说会导致SKU 被清空，是否需要处理?
        // const isGuest = getCookie(IS_GUEST);
        // if (isGuest === "true") {
        //   resetGuestToken();
        // }
      }
    } catch (error) {
      console.error("Error fetching cart info:", error);
      showToast(warningMessage, "warning");
    }
  }, [dispatch, resetGuestToken, showToast]);

  const [mutateAsync, {loading: isCartLoading}] = useRestMutation(
      "trade/cart/add",
      {
        method: "POST",
        onCompleted: () => {
          // 只要走到 onCompleted，就说明请求成功了
          handleCartSuccess(
              "Product added to cart successfully",
              "Product added, but failed to update cart"
          );
        },
        onError: (error) => {
          showToast((error as Error)?.message ?? "Error", "danger");
        },
      }
  );

  const onAddToCart = useCallback(async ({skuId, count}: {
    skuId: string;
    count: number;
    token?: string;
    cartId?: number | string;
  }) => {
    // Ensure token exists - create if needed
    let token = await getCartToken();
    if (!token) {
      token = await createGuestToken();

      if (!token) {
        showToast("Failed to create cart session", "danger");
        return;
      }
    }

    await mutateAsync({
      skuId: parseInt(skuId),
      count,
    });
  }, [createGuestToken, mutateAsync, showToast]);

  //--------Remove Cart Product Quantity--------//
  const [removeFromCart, {loading: isRemoveLoading}] = useRestMutation(
      "trade/cart/delete",
      {
        method: "DELETE",
        onCompleted: () => {
          handleCartSuccess(
              "Cart item removed successfully",
              "Item removed, but failed to update cart",
              true // 检查购物车是否为空
          );
        },
        onError: (error) => {
          showToast((error as Error)?.message ?? "Error", "danger");
        },
      },
  );

  const onAddToRemove = useCallback(async (id: number) => {
    await removeFromCart({
      ids: [id],
    });
  }, [removeFromCart]);

  //---------Update Cart Product Quantity--------//
  const [updateCartItem, {loading: isUpdateLoading}] = useRestMutation(
      "trade/cart/update-count",
      {
        method: "PUT",
        onCompleted: () => {
          handleCartSuccess(
              "Quantity updated successfully",
              "Quantity updated, but failed to update cart"
          );
        },
        onError: (error) => {
          showToast((error as Error)?.message ?? "Error", "danger");
        },
      },
  );

  const onUpdateCart = useCallback(async ({
                                            id,
                                            count,
                                          }: {
    id: number;
    count: number;
  }) => {
    if (count < 1) {
      showToast("Quantity must be at least 1", "warning");
      return;
    }
    await updateCartItem({
      id,
      count,
    });
  }, [updateCartItem, showToast]);

  return {
    isCartLoading,
    onAddToCart,
    isRemoveLoading,
    onAddToRemove,
    onUpdateCart,
    isUpdateLoading,
  };
};