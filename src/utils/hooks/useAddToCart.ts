import {useCallback} from "react";
import {useCustomToast} from "./useToast";
import {useAppDispatch} from "@/store/hooks";
import {addItem, addItemLocal, removeItemLocal, updateItemQuantityLocal,} from "@/store/slices/cart-slice";
import {getCartToken, getCookie} from "@utils/getCartToken";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {addToCart, getCartInfo, removeFromCart, updateCartItem,} from "@utils/api/cart";
import {IS_GUEST} from "@/utils/constants";
import {CartItem} from "@/types/api/trade/cart";

// A simplified product type for adding to the cart, containing only essential info.
type ProductInfo = Pick<CartItem, "spu" | "sku">;

interface AddToCartParams {
  product: ProductInfo;
  count: number;
}

interface UpdateCartParams {
  cartItemId: number; // Required for logged-in user API
  skuId: number; // Required for guest user local state
  count: number;
}

interface RemoveCartParams {
  cartItemId: number; // Required for logged-in user API
  skuId: number; // Required for guest user local state
}

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useCustomToast();
  const queryClient = useQueryClient();

  const handleSuccess = useCallback(
      async (message: string) => {
        const isGuest = getCookie(IS_GUEST) === "true";
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

  const {mutateAsync: addToCartMutation, isPending: isAddingToCart} =
      useMutation({
        mutationFn: (variables: { skuId: number; count: number }) =>
            addToCart(variables.skuId, variables.count),
        onSuccess: () => handleSuccess("Product added to cart successfully"),
        onError: handleError,
      });

  const {
    mutateAsync: removeFromCartMutation,
    isPending: isRemovingFromCart,
  } = useMutation({
    mutationFn: (ids: number[]) => removeFromCart(ids),
    onSuccess: () => handleSuccess("Cart item removed successfully"),
    onError: handleError,
  });

  const {
    mutateAsync: updateCartItemMutation,
    isPending: isUpdatingCart,
  } = useMutation({
    mutationFn: (variables: { id: number; count: number }) =>
        updateCartItem(variables.id, variables.count),
    onSuccess: () => handleSuccess("Quantity updated successfully"),
    onError: handleError,
  });

  // --- Unified Cart Operation Handlers ---

  const onAddToCart = useCallback(
      async ({product, count}: AddToCartParams) => {
        const isGuest = getCookie(IS_GUEST) === "true";

        if (isGuest) {
          const localCartItem: CartItem = {
            ...product,
            id: product.sku.id, // Use sku.id as a temporary unique ID for local state
            count,
            selected: true, // Default to selected
          };
          dispatch(addItemLocal(localCartItem));
          showToast("Product added to cart successfully", "success");
        } else {
          const token = await getCartToken();
          if (!token) {
            showToast("Please log in to add items to your cart.", "warning");
            return;
          }
          await addToCartMutation({skuId: product.sku.id, count});
        }
      },
      [dispatch, showToast, addToCartMutation],
  );

  const onRemoveItem = useCallback(
      async ({cartItemId, skuId}: RemoveCartParams) => {
        const isGuest = getCookie(IS_GUEST) === "true";

        if (isGuest) {
          dispatch(removeItemLocal(skuId));
          showToast("Cart item removed successfully", "success");
        } else {
          await removeFromCartMutation([cartItemId]);
        }
      },
      [dispatch, showToast, removeFromCartMutation],
  );

  const onUpdateItem = useCallback(
      async ({cartItemId, skuId, count}: UpdateCartParams) => {
        if (count < 1) {
          // If count drops to 0, it's a removal.
          await onRemoveItem({cartItemId, skuId});
          return;
        }
        const isGuest = getCookie(IS_GUEST) === "true";

        if (isGuest) {
          dispatch(updateItemQuantityLocal({skuId, count}));
          showToast("Quantity updated successfully", "success");
        } else {
          await updateCartItemMutation({id: cartItemId, count});
        }
      },
      [dispatch, showToast, updateCartItemMutation, onRemoveItem],
  );

  return {
    isCartLoading: isAddingToCart,
    isRemoveLoading: isRemovingFromCart,
    isUpdateLoading: isUpdatingCart,
    onAddToCart,
    onRemoveItem,
    onUpdateItem,
  };
};