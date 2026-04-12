"use client";

import {useRestMutation} from "@utils/hooks/useCustomMutation";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {addItem} from "@/store/slices/cart-slice";
import {useCallback, useEffect, useRef, useState} from "react";
import {getCartToken} from "@/utils/getCartToken";
import {Cart} from "@/types/api/trade/cart";


export function useCartDetail() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cartDetail.cart);
  const [isInFlight, setIsInFlight] = useState(false);
  const isInFlightRef = useRef(false);
  const hasFetchedRef = useRef(false); // 跟踪是否已经获取过数据

  const [getCartDetailMutation, {loading: isLoading, error}] =
      useRestMutation("trade/cart/list", {
        method: "GET",
        onCompleted: (response) => {

          // 转换新的响应结构为旧的 Cart 类型
          const validItems = response.validList || [];
          const itemsQty = validItems.reduce((total: number, item: { count: number; }) => total + item.count, 0);

          // 构建符合 Cart 类型的对象
          const cart: Cart = {
            itemsQty: itemsQty,
            items: validItems,
          };

          if (cart) {
            dispatch(addItem(cart));
          }
        },
        onError: (error) => {
          console.error("Cart detail error:", error);
        },
      });

  // 使用 ref 跟踪最新的 getCartDetailMutation
  const getCartDetailMutationRef = useRef(getCartDetailMutation);

  useEffect(() => {
    getCartDetailMutationRef.current = getCartDetailMutation;
  }, [getCartDetailMutation]);


  const getCartDetail = useCallback(async (force: boolean = false) => {
    // 防止重复请求，除非强制刷新
    if (isInFlightRef.current || (!force && hasFetchedRef.current)) return;
    isInFlightRef.current = true;

    const token = await getCartToken();
    if (!token) {
      isInFlightRef.current = false;
      return;
    }

    setIsInFlight(true);
    try {
      await getCartDetailMutationRef.current();
      hasFetchedRef.current = true; // 标记已获取数据
    } catch (e) {
      throw e;
    } finally {
      isInFlightRef.current = false;
      setIsInFlight(false);
    }
  }, []);

  useEffect(() => {
    // 在组件首次渲染时执行，或当 cart 变为 null 时重新执行
    if (!cart && !isInFlightRef.current) {
      getCartDetail();
    }
  }, [cart, getCartDetail]);

  return {
    cartData: cart,
    getCartDetail,
    isLoading: isLoading || (isInFlight && !cart),
    error,
  };
}