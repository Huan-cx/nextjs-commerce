"use client";

import {useQuery} from "@tanstack/react-query";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {addItem} from "@/store/slices/cart-slice";
import {getCartInfo} from "@/utils/api/cart";
import {getCartToken, getCookie} from "@/utils/getCartToken";
import {useEffect} from "react";
import {IS_GUEST} from "@/utils/constants";

export function useCartDetail() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cartDetail.cart);

  const {data, isLoading, error, refetch, isSuccess} = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const isGuest = getCookie(IS_GUEST) === "true";
      if (isGuest) {
        return null; // Do not fetch for guest users
      }
      const token = await getCartToken();
      if (!token) {
        return null;
      }
      return getCartInfo();
    },
    // We control when to fetch manually, so disable automatic refetching behaviors
    enabled: false,
  });

  // Effect to sync query data to Redux store on success
  useEffect(() => {
    if (isSuccess && data) {
      dispatch(addItem(data));
    }
  }, [isSuccess, data, dispatch]);

  // Effect to log errors
  useEffect(() => {
    if (error) {
      console.error("Cart detail error:", error);
    }
  }, [error]);

  // Effect to fetch cart details on initial load if not already present
  useEffect(() => {
    const isGuest = getCookie(IS_GUEST) === "true";
    if (!cart && !isGuest) {
      refetch();
    }
  }, [cart, refetch]);

  return {
    cartData: cart, // Continue providing the cart data from Redux for consistency
    getCartDetail: refetch, // Expose the refetch function as getCartDetail
    isLoading,
    error,
  };
}