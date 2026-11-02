'use client';

import {useEffect} from 'react';
import {trackBeginCheckout} from '@/lib/analytics';

interface BeginCheckoutTrackerProps {
  value?: number;
  currency?: string;
  itemCount?: number;
}

/**
 * 发起结算事件追踪
 * 进入 checkout 页面时触发
 */
export function BeginCheckoutTracker({value, currency, itemCount}: BeginCheckoutTrackerProps) {
  useEffect(() => {
    trackBeginCheckout({value, currency, items: itemCount ? [{quantity: 1}] : undefined});
  }, []); // 只在首次挂载时触发

  return null;
}
