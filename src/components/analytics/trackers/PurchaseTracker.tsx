'use client';

import {useEffect} from 'react';
import {trackPurchase} from '@/lib/analytics';
import {ORDER_ID} from '@/utils/constants';
import {getCookie} from '@utils/getCartToken';

interface PurchaseTrackerProps {
  /** 订单总金额（如果已从服务端获取） */
  value?: number;
  currency?: string;
}

/**
 * 购买完成事件追踪
 * 在订单成功页加载时触发
 * 从 cookie 中读取 ORDER_ID
 */
export function PurchaseTracker({value, currency}: PurchaseTrackerProps) {
  useEffect(() => {
    // 读取 cookie 中的订单 ID
    const orderId = getCookie(ORDER_ID);

    trackPurchase({
      order_id: orderId || undefined,
      orderId: orderId || undefined,
      value,
      currency,
    });
  }, []); // 只在首次挂载时触发

  return null;
}
