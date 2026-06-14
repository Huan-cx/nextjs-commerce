import {useCallback} from "react";
import {useCustomToast} from "./useToast";
import {useAppDispatch} from "@/store/hooks";
import {addItemLocal, removeItemLocal, updateItemQuantityLocal,} from "@/store/slices/cart-slice";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {addToCart, removeFromCart, updateCartItem,} from "@utils/api/cart";
import {CartItem} from "@/types/api/trade/cart";
import {useAuthStatus} from "@utils/hooks/useAuthStatus";

export const useCart = () => {

  const dispatch = useAppDispatch();
  const { showToast } = useCustomToast();
  const queryClient = useQueryClient();
  const {isGuest} = useAuthStatus();

  const handleSuccess = useCallback(
      async (message: string, isGuest: boolean = false) => {
        // 对于登录用户，让 React Query 统一管理购物车同步
        // ✅ 修复：移除此处的手动同步，避免与 useCartDetail 的 effect 重复触发
        // 之前：这里手动 getCartInfo + dispatch(addItem)
        // 问题：invalidateQueries 后 useCartDetail 会再次查询并 dispatch，
        //      虽然 addItem 是覆盖操作不会翻倍，但会造成重复渲染
        if (!isGuest) {
          // 只让 React Query 重新查询，由 useCartDetail 统一同步到 Redux
          await queryClient.invalidateQueries({queryKey: ["cart"]});
        }
        showToast(message, "success");
      },
      [dispatch, showToast, queryClient],
  );

  const handleError = (error: unknown) => {
    const message =
        error instanceof Error ? error.message : "An unknown error occurred";
    showToast(message, "danger");
  };

  // --- Mutations for Logged-In Users ---
  const {mutateAsync: addToCartMutation, isPending: isCartLoading} =
      useMutation({
        mutationFn: (variables: { skuId: number; count: number }) =>
            addToCart(variables.skuId, variables.count),
        onSuccess: () => handleSuccess("Product added to cart successfully", isGuest),
        onError: handleError,
      });

  const {
    mutateAsync: removeFromCartMutation,
    isPending: isRemoveLoading,
  } = useMutation({
    mutationFn: (ids: number[]) => removeFromCart(ids),
    onSuccess: () => handleSuccess("Cart item removed successfully", isGuest),
    onError: handleError,
  });

  const {
    mutateAsync: updateCartItemMutation,
    isPending: isUpdateLoading,
  } = useMutation({
    mutationFn: (variables: { id: number; count: number }) =>
        updateCartItem(variables.id, variables.count),
    onSuccess: () => handleSuccess("Quantity updated successfully", isGuest),
    onError: handleError,
  });

  // --- Unified Cart Operation Handlers ---

  const onAddToCart = useCallback(
      async (product: CartItem, isGuest: boolean = false) => {
        const skuId = product.sku.id;
        if (skuId) {
          if (isGuest) {
            const localCartItem: CartItem = {
              ...product,
            };
            dispatch(addItemLocal(localCartItem));
            showToast("Product added to cart successfully", "success");
          } else {
            await addToCartMutation({skuId: skuId, count: product.count});
          }
        }
      },
      [dispatch, showToast, addToCartMutation],
  );

  const onRemoveItem = useCallback(
      async (item: CartItem, isGuest: boolean) => {

        if (isGuest) {
          dispatch(removeItemLocal(item.sku.id));
          showToast("Cart item removed successfully", "success");
        } else {
          await removeFromCartMutation([item.id]);
        }
      },
      [dispatch, showToast, removeFromCartMutation],
  );

  const onUpdateItem = useCallback(
      async (item: CartItem, newCount: number, isGuest: boolean) => {
        if (newCount < 1) {
          // If count drops to 0, it's a removal.
          await onRemoveItem(item, isGuest);
          return;
        }
        if (isGuest) {
          dispatch(updateItemQuantityLocal({skuId: item.sku.id, count: newCount}));
          showToast("Quantity updated successfully", "success");
        } else {
          await updateCartItemMutation({id: item.id, count: newCount});
        }
      },
      [dispatch, showToast, updateCartItemMutation, onRemoveItem],
  );


  return {
    isCartLoading,
    isRemoveLoading,
    isUpdateLoading,
    onAddToCart,
    onRemoveItem,
    onUpdateItem,
  };
};