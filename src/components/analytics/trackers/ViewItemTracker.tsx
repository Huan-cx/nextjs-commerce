'use client';

import {useEffect} from 'react';
import {trackViewItem} from '@/lib/analytics';

interface ViewItemTrackerProps {
  productId?: number | string;
  productName?: string;
  price?: number;
  currency?: string;
  categoryId?: number;
}

/**
 * 产品详情页 view_item 事件追踪
 * Server Component (ProductPage) 渲染此 Client Component 传递数据
 */
export function ViewItemTracker({
                                  productId,
                                  productName,
                                  price,
                                  currency,
                                  categoryId,
                                }: ViewItemTrackerProps) {
  useEffect(() => {
    if (productId === undefined) return;
    trackViewItem({
      product_id: productId,
      productId,
      name: productName,
      price,
      currency,
      category_id: categoryId,
    });
  }, [productId]); // 只在产品 ID 变化时触发

  return null;
}
