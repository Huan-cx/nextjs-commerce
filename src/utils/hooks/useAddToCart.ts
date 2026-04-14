import {useCallback} from "react";
import {useCustomToast} from "./useToast";
import {useAppDispatch} from "@/store/hooks";
import {addItem, addItemLocal, removeItemLocal, updateItemQuantityLocal,} from "@/store/slices/cart-slice";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {addToCart, getCartInfo, removeFromCart, updateCartItem,} from "@utils/api/cart";
import {CartItem} from "@/types/api/trade/cart";
import {useAuthStatus} from "@utils/hooks/useAuthStatus";

export const useCart = () => {

  const dispatch = useAppDispatch();
  const { showToast } = useCustomToast();
  const queryClient = useQueryClient();
  const {isGuest} = useAuthStatus();

  const handleSuccess = useCallback(
      async (message: string, isGuest: boolean = false) => {
        // For logged-in users, refetch the cart from the server to ensure consistency.
        if (!isGuest) {
          try {
            const cartInfo = await getCartInfo();
            dispatch(addItem(cartInfo));
          } catch (error) {
            console.error("Error fetching cart info after operation:", error);
            showToast("Operation successful, but failed to refresh cart", "warning");
            return; // Exit if fetching updated cart fails
          }
      }
        showToast(message, "success");
        // Invalidate queries to reflect changes, especially after login/merge.
        await queryClient.invalidateQueries({queryKey: ["cart"]});
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