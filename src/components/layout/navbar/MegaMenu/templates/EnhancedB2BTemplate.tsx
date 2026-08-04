import {useEffect, useRef, useState} from 'react';
import Link from '@/components/common/Link';
import type {Category} from '@/types/api/product/type';
import {Card, CardBody} from '@heroui/react';
import {useTranslations} from 'next-intl';

interface EnhancedB2BTemplateProps {
  categories: Category[];
  hoveredCategory: number | null;
  setHoveredCategory: (id: number | null) => void;
}

export default function EnhancedB2BTemplate({
                                              categories,
                                              hoveredCategory,
                                              setHoveredCategory
                                            }: EnhancedB2BTemplateProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(70);
  const t = useTranslations('navbar');

  // 动态计算菜单顶部位置
  useEffect(() => {
    const updateMenuPosition = () => {
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const navbarHeight = buttonRect.bottom;
        setMenuTop(navbarHeight);
      }
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    return () => window.removeEventListener('resize', updateMenuPosition);
  }, []);

  // 点击外部区域关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // 检查点击的是否是菜单按钮本身
        const button = menuRef.current.parentElement?.querySelector('button');
        if (button && !button.contains(event.target as Node)) {
          setIsMenuOpen(false);
          setHoveredCategory(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setHoveredCategory]);

  const toggleMenu = () => {
    if (isMenuOpen) {
      // 如果菜单已打开，则关闭
      setIsMenuOpen(false);
    } else {
      // 如果菜单关闭，则打开（显示第一个分类的内容）
      setIsMenuOpen(true);
      if (categories.length > 0) {
        setHoveredCategory(categories[0].id);
      }
    }
  };

  return (
      <div className="relative">
        {/* 主菜单项 */}
        <ul className="flex items-center space-x-1">
          <li>
            <button
                ref={buttonRef}
                className="text-nowrap relative text-neutral-500 before:absolute before:bottom-0 before:left-0 before:h-px before:w-0 before:bg-current before:transition-all before:duration-300 before:content-[''] hover:text-black hover:before:w-full dark:text-neutral-400 dark:hover:text-neutral-300 px-4 py-5 inline-flex items-center text-sm font-medium gap-1"
                onClick={toggleMenu}
            >

              {t('products')}
            </button>

            {/* 巨型菜单面板 */}
            <div
                ref={menuRef}
                className={`fixed inset-x-0 bg-white shadow-2xl border-t border-neutral-200 z-50 transition-all duration-300 ${
                    isMenuOpen ? 'opacity-100 visible translate-y-0 pointer-events-auto' : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                }`}
                style={{top: `${menuTop}px`}}
            >
              <div className="max-w-screen-2xl mx-auto flex min-h-[480px]">
                {/* 左侧一级分类 */}
                <div className="w-64 bg-neutral-50 border-r border-neutral-100 p-2 flex flex-col">
                  {categories.slice(0, 6).map((cat) => (
                      <button
                          key={cat.id}
                          className={`flex items-center justify-between p-3 text-sm rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 mt-1 ${
                              hoveredCategory === cat.id ? 'bg-white text-black dark:text-white shadow-sm border border-neutral-100' : ''
                          }`}
                          onMouseEnter={() => setHoveredCategory(cat.id)}
                      >
                        <span>{cat.name}</span>
                        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </button>
                  ))}
                </div>

                {/* 右侧二三级分类 */}
                <div className="flex-1 p-8 grid grid-cols-3 gap-x-8 gap-y-6 overflow-y-auto max-h-[480px]">
                  {hoveredCategory ? (
                      <>
                        {categories
                            .find(c => c.id === hoveredCategory)
                            ?.children
                            ?.map((subCat: Category) => (
                                <div key={subCat.id}>
                                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 border-b border-neutral-100 dark:border-neutral-700 pb-2 mb-3">
                                    <span className="w-1 h-3.5 bg-blue-600 rounded-full"></span>
                                    {subCat.name}
                                  </h4>
                                  <ul className="space-y-2">
                                    {subCat.children?.slice(0, 5).map((thirdCat: Category) => (
                                        <li key={thirdCat.id}>
                                          <Link
                                              href={thirdCat.slug ? `/category/${thirdCat.slug}` : '#'}
                                              onClick={() => setIsMenuOpen(false)}
                                              className="text-xs text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-neutral-300 block py-1"
                                          >
                                            {thirdCat.name}
                                          </Link>
                                        </li>
                                    ))}
                                  </ul>
                                </div>
                            ))
                        }
                      </>
                  ) : (
                      <div className="col-span-3 text-center py-10 text-neutral-500">
                        {t('selectCategory')}
                      </div>
                  )}
                </div>

                {/* 右侧边栏：B2B 服务 */}
                <div className="w-64 bg-slate-50 border-l border-neutral-200 p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase">{t('bulkPurchase')}</h5>

                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700">
                      <CardBody className="p-4">
                        <h6 className="text-xs font-bold text-white mb-1">{t('bulkQuote')}</h6>
                        <p className="text-[11px] text-blue-100 mb-3 leading-relaxed">
                          {t('bulkQuoteDesc')}
                        </p>
                        <Link
                            href="/rfq/create"
                            onClick={() => setIsMenuOpen(false)}
                            className="inline-block bg-white text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
                        >
                          {t('requestQuote')}
                        </Link>
                      </CardBody>
                    </Card>

                    <Link
                        href="/catalogs"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-200 bg-white hover:border-blue-400 transition-colors"
                    >
                      <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <div className="text-[11px]">
                        <span
                            className="font-semibold text-neutral-700 dark:text-neutral-300 block">{t('catalogManual')}</span>
                        <span className="text-neutral-400 dark:text-neutral-500 block">{t('catalogSize')}</span>
                      </div>
                    </Link>
                  </div>

                  <div
                      className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center border-t border-neutral-200 dark:border-neutral-700 pt-3">
                    {t('hotline')}
                  </div>
                </div>
              </div>
            </div>
          </li>

          {/* 其他主菜单项 */}
          <li>
            <Link
                href="/b2b/wholesale"
                className="text-nowrap relative text-neutral-500 before:absolute before:bottom-0 before:left-0 before:h-px before:w-0 before:bg-current before:transition-all before:duration-300 before:content-[''] hover:text-black hover:before:w-full dark:text-neutral-400 dark:hover:text-neutral-300 px-4 py-5 inline-flex items-center text-sm font-medium"
            >
              {t('wholesale')}
            </Link>
          </li>
          <li>
            <Link
                href="/projects"
                className="text-nowrap relative text-neutral-500 before:absolute before:bottom-0 before:left-0 before:h-px before:w-0 before:bg-current before:transition-all before:duration-300 before:content-[''] hover:text-black hover:before:w-full dark:text-neutral-400 dark:hover:text-neutral-300 px-4 py-5 inline-flex items-center text-sm font-medium"
            >
              {t('projects')}
            </Link>
          </li>
        </ul>
      </div>
  );
}