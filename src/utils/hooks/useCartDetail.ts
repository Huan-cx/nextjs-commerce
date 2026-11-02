"use client";

import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {addItem, clearCart, enrichGuestCartItems} from "@/store/slices/cart-slice";
import {getCartInfo, getCartSkuInfo, mergeCart} from "@/utils/api/cart";
import {useEffect, useRef} from "react";

import {useAuthStatus} from "@utils/hooks/useAuthStatus";

export function useCartDetail() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const cart = useAppSelector((state) => state.cartDetail.cart);
  // ✅ useAuthStatus 已修复：loading 时 isGuest=false，isLoading=true
  const {isGuest, isLoading: isAuthLoading} = useAuthStatus();

  // 记录上一次的访客状态，用于检测登录瞬间
  // ✅ 修复1: 初始值设为 false，避免组件重新挂载时被重置
  const wasGuestRef = useRef(false);
  // ✅ 修复2: 增加合并状态标记，防止重复合并（组件生命周期内只合并一次）
  const hasMergedRef = useRef(false);

  // Query for logged-in user's cart
  // 【修复说明】
  // 之前：enabled: !isGuest
  // 问题：isGuest 在 loading 时曾经 = true，导致查询不执行
  // 现在：isGuest 只在确认未登录时 = true，配合 isAuthLoading 控制
  // 当 isAuthLoading 时，enabled=true（正在加载 session，先不执行）
  const {data, isLoading, error, refetch, isSuccess} = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      return getCartInfo();
    },
    // ✅ 修复：session 加载完成且已登录时才启用查询
    // loading 时不启用，避免发起无 token 请求
    enabled: !isGuest && !isAuthLoading,
  });

  // ✅ 初始化时同步 isGuest 状态
  useEffect(() => {
    if (!isAuthLoading) {
      wasGuestRef.current = isGuest;
    }
  }, [isAuthLoading, isGuest]);

  // 【新增】自动合并购物车逻辑
  // 检测：从访客状态 → 已登录状态，且本地购物车有商品
  useEffect(() => {
    // ✅ 修复3: 增加更多安全检查
    // 1. 从访客状态切换到已登录
    const justLoggedIn = wasGuestRef.current && !isGuest && !isAuthLoading;
    // 2. 有商品
    const hasItems = cart && cart.items && cart.items.length > 0;
    // 3. 是游客购物车（游客购物车没有 id 字段，服务端购物车 id=1）
    const isGuestCart = !cart?.id;
    // 4. 本会话内还没合并过
    const notYetMerged = !hasMergedRef.current;

    if (justLoggedIn && hasItems && isGuestCart && notYetMerged) {
      console.warn("[useCartDetail] Login detected, auto merging cart...");

      // 标记即将合并，防止并发触发
      hasMergedRef.current = true;

      const mergeItems = cart.items.map((item) => ({
        skuId: item.sku.id,
        count: item.count,
      }));

      // 执行合并（不阻塞 UI）
      mergeCart(mergeItems)
          .then(() => {
            console.warn("[useCartDetail] Cart merged successfully");
            // 合并成功后：
            // 1. 清理本地购物车（避免下次登录重复合并）
            dispatch(clearCart());
            // 2. 让 React Query 重新拉取服务端购物车数据
            queryClient.invalidateQueries({queryKey: ["cart"]});
          })
          .catch((error) => {
            console.error("[useCartDetail] Cart merge failed:", error);
            // 合并失败不做强制处理，保留本地购物车
            // 用户可以在购物车页面手动触发重试
            // 重置合并标记，允许重试
            hasMergedRef.current = false;
          });
    }

    // 更新状态
    wasGuestRef.current = isGuest;
  }, [isGuest, isAuthLoading, cart, dispatch, queryClient]);

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
  // ✅ 修复：只在非访客且 session 加载完成时才 refetch
  useEffect(() => {
    if (!cart && !isGuest && !isAuthLoading) {
      refetch();
    }
  }, [cart, isGuest, isAuthLoading, refetch]);

  return {
    cart,
    getCartDetail: refetch,
    isLoading: isLoading || isGuestEnriching, // Combine loading states
    error: error || enrichError,
  };
}
