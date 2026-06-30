'use client';

import {useState} from 'react';
import Link from '@/components/common/Link';
import {useTranslations} from 'next-intl';
import {Menu} from 'lucide-react';
import {Button} from '@heroui/react';
import {B2BTemplate, EcommerceTemplate, EnhancedB2BTemplate, SimpleTemplate} from './templates';
import type {Category} from '@/types/api/product/type';

interface MegaMenuBaseProps {
  template?: 'default' | 'b2b' | 'enhanced-b2b' | 'ecommerce' | 'simple'; // 可扩展的模板类型
  categories: Category[]; // 从外部传入的分类数据
}

export default function MegaMenuBase({template = 'b2b', categories}: MegaMenuBaseProps) {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('navbar');

  // 使用传入的分类数据，已在外部处理好国际化翻译
  const translatedTreeData = categories;

  // 渲染模板
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

        {/* 移动端菜单按钮 */}
        <div className="lg:hidden flex items-center">
          <Button
              variant="light"
              onPress={() => setMobileMenuOpen(true)}
              startContent={<Menu size={20}/>}
          >
            {t('all')}
          </Button>
        </div>

        {/* 移动端菜单弹窗 */}
        {mobileMenuOpen && (
            <div
                className="fixed inset-0 z-50 bg-white lg:hidden transition-opacity duration-300"
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">{t('all')}</h2>
                  <Button variant="light" onPress={() => setMobileMenuOpen(false)}>
                    关闭
                  </Button>
                </div>
                <MobileMenuContent
                    categories={translatedTreeData}
                    onClose={() => setMobileMenuOpen(false)}
                />
              </div>
            </div>
        )}
      </div>
  );
}

// 移动端菜单内容
const MobileMenuContent = ({
                             categories,
                             onClose
                           }: {
  categories: Category[];
  onClose: () => void;
}) => {
  return (
      <div className="space-y-4">
        {categories.map(cat => (
            <div key={cat.id} className="border-b border-gray-100 pb-3">
              <Link
                  href={`/category/${cat.slug}`}
                  className="block font-medium text-gray-900 hover:text-primary-600 transition-colors duration-200 py-2"
                  onClick={onClose}
              >
                {cat.name}
              </Link>

              {cat.children && cat.children.length > 0 && (
                  <div className="pl-4 mt-2 space-y-1">
                    {cat.children.map(subCat => (
                        <Link
                            key={subCat.id}
                            href={`/category/${subCat.slug}`}
                            className="block text-sm text-gray-700 hover:text-primary-600 transition-colors duration-200 py-1"
                            onClick={onClose}
                        >
                          {subCat.name}
                        </Link>
                    ))}
                  </div>
              )}
            </div>
        ))}
      </div>
  );
};