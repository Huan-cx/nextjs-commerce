import { useCustomToast } from "./useToast";
import { useAppDispatch } from "@/store/hooks";
import { addItem, clearCart } from "@/store/slices/cart-slice";
import { isObject } from "@utils/type-guards";
import { getCartToken, getCookie } from "@utils/getCartToken";
import { useGuestCartToken } from "./useGuestCartToken";
import { IS_GUEST } from "@/utils/constants";
import { useMutation } from "@apollo/client";
import {
  CREATE_ADD_PRODUCT_IN_CART,
  REMOVE_CART_ITEM,
  UPDATE_CART_ITEM,
} from "@/graphql";




export const useAddProduct = () => {
  const dispatch = useAppDispatch();
  const { createGuestToken, resetGuestToken } = useGuestCartToken();
  const { showToast } = useCustomToast();

  const [mutateAsync, { loading: isCartLoading }] = useMutation(
    CREATE_ADD_PRODUCT_IN_CART,
    {
      onCompleted: (res) => {
        const responseData = res?.createAddProductInCart?.addProductInCart;

        if (!responseData?.success) {
          showToast(responseData?.message || "Error adding to cart", "danger");
          return;
        }
        if (responseData) {
          if (responseData.success) {
            dispatch(addItem(responseData as any));
            showToast("Product added to cart successfully", "success");
          }
        }
      },

      onError: (err) => {
        showToast(err?.message ?? "Error", "danger");
      },
    },
  );

  const onAddToCart = async ({
    productId,
    quantity,
  }: {
    productId: string;
    quantity: number;
    token?: string;
    cartId?: number | string;
  }) => {
    // Ensure token exists - create if needed
    let token = getCartToken();

    if (!token) {
      token = await createGuestToken();

      if (!token) {
        showToast("Failed to create cart session", "danger");
        return;
      }
    }

    await mutateAsync({
      variables: {
        productId: parseInt(productId),
        quantity,
      },
    });
  };

  //--------Remove Cart Product Quantity--------//
  const [removeFromCart, { loading: isRemoveLoading }] = useMutation(
    REMOVE_CART_ITEM,
    {
      onCompleted: async (response) => {
        const responseData = response?.createRemoveCartItem?.removeCartItem;
        if (isObject(responseData)) {
          const message = "Cart item removed successfully";
          dispatch(addItem(responseData as any));
          showToast(message as string, "warning");

          if (!responseData?.itemsQty) {
            dispatch(clearCart());

            const isGuest = getCookie(IS_GUEST);
            if (isGuest === "true") {
              resetGuestToken();
            }
          }
        } else {
          showToast("Something went wrong", "warning");
        }
      },
      onError: (error) => {
        showToast(error?.message as string, "danger");
      },
    },
  );

  const onAddToRemove = async (productId: string) => {
    await removeFromCart({
      variables: {
        cartItemId: parseInt(productId),
      },
    });
  };

  //---------Update Cart Product Quantity--------//
  const [updateCartItem, { loading: isUpdateLoading }] = useMutation(
    UPDATE_CART_ITEM,
    {
      onCompleted: (response: any) => {
        const responseData = response?.createUpdateCartItem?.updateCartItem;

        if (isObject(responseData)) {
          dispatch(addItem(responseData as any));
        } else {
          showToast("Something went wrong!", "warning");
        }
      },

      onError: (error) => {
        showToast(error?.message as string, "danger");
      },
    },
  );

  const onUpdateCart = async ({
    cartItemId,
    quantity,
  }: {
    cartItemId: number;
    quantity: number;
  }) => {
    if (quantity < 1) {
      showToast("Quantity must be at least 1", "warning");
      return;
    }

    await updateCartItem({
      variables: {
        cartItemId: cartItemId,
        quantity,
      },
    });
  };

  return {
    isCartLoading,
    onAddToCart,
    isRemoveLoading,
    onAddToRemove,
    onUpdateCart,
    isUpdateLoading,
  };
};
