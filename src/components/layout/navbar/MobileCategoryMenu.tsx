"use client";

import {useState} from 'react';
import {Input} from '@heroui/react';
import Link from '@/components/common/Link';
import {useBodyScrollLock} from '@utils/hooks/useBodyScrollLock';
import {useTranslations} from 'next-intl';
import {motion} from 'framer-motion';
import {Search} from 'lucide-react';
import Image from 'next/image';
import type {Category} from '@/types/api/product/type';

export interface MobileCategoryMenuProps {
  categories: Category[];
  onClose: () => void;
}

export default function MobileCategoryMenu({categories, onClose}: MobileCategoryMenuProps) {
  const t = useTranslations('mobileMenu');
  const [activeCategory, setActiveCategory] = useState<number | null>(
      categories.length > 0 ? categories[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');

  useBodyScrollLock(true);

  const activeCategoryData = categories.find((cat) => cat.id === activeCategory);

  const filteredCategories = categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
      <motion.div
          initial={{x: '-100%'}}
          animate={{x: 0}}
          exit={{x: '-100%'}}
          transition={{type: 'spring', damping: 25, stiffness: 200}}
          className="fixed left-0 z-50 w-full bg-white lg:hidden"
          style={{
            top: '68px',
            bottom: '64px',
            height: 'calc(var(--visual-viewport-height) - 132px)',
            maxWidth: '560px', // 平板端更宽
          }}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* 顶部搜索区 */}
          <div className="bg-white px-4 pt-4 pb-3 border-b border-neutral-100 shrink-0">
            <div className="relative">
              <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none"/>
              <Input
                  placeholder={t('searchPlaceholder') || 'Search categories, products or specs...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 text-xs bg-neutral-100 focus:bg-white focus:ring-1 focus:ring-blue-600 rounded-xl pl-8"
              />
            </div>
          </div>

          {/* 双栏联动核心区 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 左栏：一级索引 */}
            <div
                className="w-[30%] max-w-[120px] min-w-[90px] bg-neutral-100 overflow-y-auto flex flex-col shrink-0 border-r border-neutral-200/60 select-none">
              {filteredCategories.map((cat) => (
                  <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`p-2.5 min-h-[56px] flex items-center text-left border-l-4 transition-all ${
                          activeCategory === cat.id
                              ? 'bg-white border-l-blue-600'
                              : 'border-l-transparent border-b border-neutral-200/40 hover:bg-neutral-50'
                      }`}
                  >
                <span
                    className={`text-xs leading-tight break-words hyphens-auto ${
                        activeCategory === cat.id
                            ? 'font-bold text-neutral-900'
                            : 'font-medium text-neutral-600'
                    }`}
                >
                  {cat.name}
                </span>
                  </button>
              ))}
            </div>

            {/* 右栏：二三级分类 */}
            <div className="flex-1 bg-white overflow-y-auto select-none">
              {activeCategoryData?.children && activeCategoryData.children.length > 0 ? (
                  activeCategoryData.children.map((subCat) => (
                      <div key={subCat.id} className="relative">
                        {/* 二级标题吸顶 */}
                        <div
                            className="sticky top-0 bg-white/95 backdrop-blur-sm px-4 py-2 border-b border-neutral-100 z-10 flex justify-between items-center">
                          <h4 className="text-xs font-bold text-neutral-900 tracking-wide">
                            {subCat.name}
                          </h4>
                          <span className="text-[9px] text-neutral-400 font-mono">
                      {subCat.children?.length || 0} Categories
                    </span>
                        </div>

                        {/* 三级分类网格 */}
                        <div className="p-3 grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-2">
                          {subCat.children?.slice(0, 10).map((thirdCat) => (
                              <Link
                                  key={thirdCat.id}
                                  href={thirdCat.slug ? `/category/${thirdCat.slug}` : '/search'}
                                  onClick={() => onClose()}
                                  className="flex items-center gap-2 py-1 px-1.5 rounded-md hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all min-w-0"
                              >
                                <div
                                    className="w-7 h-7 bg-neutral-100 rounded border border-neutral-200/60 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                                  <Image
                                      alt={thirdCat.name}
                                      src={`https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20icon%20${encodeURIComponent(thirdCat.name)}&image_size=square`}
                                      width={24}
                                      height={24}
                                      className="w-full h-full object-cover rounded-sm"
                                  />
                                </div>
                                <span
                                    className="text-[11px] font-medium text-neutral-700 leading-tight break-words min-w-0 line-clamp-2">
                          {thirdCat.name}
                        </span>
                              </Link>
                          ))}
                        </div>
                      </div>
                  ))
              ) : (
                  <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">
                    {t('noSubcategories') || 'No subcategories'}
                  </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
  );
}