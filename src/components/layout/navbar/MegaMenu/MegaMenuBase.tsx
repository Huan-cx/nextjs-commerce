'use client';

import {useState} from 'react';
import {B2BTemplate, EcommerceTemplate, EnhancedB2BTemplate, SimpleTemplate} from './templates';
import type {Category} from '@/types/api/product/type';

interface MegaMenuBaseProps {
  template?: 'default' | 'b2b' | 'enhanced-b2b' | 'ecommerce' | 'simple';
  categories: Category[];
}

export default function MegaMenuBase({template = 'b2b', categories}: MegaMenuBaseProps) {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  const translatedTreeData = categories;

  const renderTemplate = () => {
    switch (template) {
      case 'enhanced-b2b':
        return <EnhancedB2BTemplate
            categories={translatedTreeData}
            hoveredCategory={hoveredCategory}
            setHoveredCategory={setHoveredCategory}
        />;
      case 'b2b':
        return <B2BTemplate
            categories={translatedTreeData}
            hoveredCategory={hoveredCategory}
            setHoveredCategory={setHoveredCategory}
        />;
      case 'ecommerce':
        return <EcommerceTemplate
            categories={translatedTreeData}
            hoveredCategory={hoveredCategory}
            setHoveredCategory={setHoveredCategory}
        />;
      case 'simple':
      case 'default':
      default:
        return <SimpleTemplate
            categories={translatedTreeData}
        />;
    }
  };

  return (
      <div className="relative">
        {/* 桌面端菜单 */}
        <div className="hidden lg:block">
          {renderTemplate()}
        </div>
      </div>
  );
}