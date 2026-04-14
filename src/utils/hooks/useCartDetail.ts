"use client";

import {useQuery} from "@tanstack/react-query";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {addItem, enrichGuestCartItems} from "@/store/slices/cart-slice";
import {getCartInfo, getCartSkuInfo} from "@/utils/api/cart";
import {useEffect} from "react";

import {useAuthStatus} from "@utils/hooks/useAuthStatus";

export function useCartDetail() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cartDetail.cart);
  const {isGuest} = useAuthStatus();
  // Query for logged-in user's cart

  const {data, isLoading, error, refetch, isSuccess} = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      return getCartInfo();
    },
    // We control when to fetch manually, so disable automatic refetching behaviors
    enabled: !isGuest,
  });

  // Query to enrich guest cart items with detailed product info
  const itemsToEnrich = isGuest && cart ? cart.items.filter(item => !item.spu) : [];
  const skuIdsToEnrich = itemsToEnrich.map(item => item.sku.id);

  const {isLoading: isGuestEnriching, data: enrichedData, error: enrichError} = useQuery({
    queryKey: ['guestCartEnrich', skuIdsToEnrich],
    queryFn: () => getCartSkuInfo(skuIdsToEnrich),
    enabled: skuIdsToEnrich.length > 0,
  });

  // Effect to sync logged-in cart data to Redux store on success
  useEffect(() => {
    if (isSuccess && data) {
      dispatch(addItem(data));
    }
  }, [isSuccess, data, dispatch]);

  // Effect to sync enriched guest data to Redux store
  useEffect(() => {
    if (enrichedData) {
      dispatch(enrichGuestCartItems(enrichedData));
    }
  }, [enrichedData, dispatch]);

  // Effect to log errors
  useEffect(() => {
    if (error) {
      console.error("Cart detail error:", error);
    }
    if (enrichError) {
      console.error("Failed to enrich guest cart items:", enrichError);
    }
  }, [error, enrichError]);

  // Effect to fetch cart details on initial load if not already present
  useEffect(() => {
    if (!cart && !isGuest) {
      refetch();
    }
  }, [cart, isGuest, refetch]);

  return {
    cart,
    getCartDetail: refetch,
    isLoading: isLoading || isGuestEnriching, // Combine loading states
    error: error || enrichError,
  };
}