import type {Category} from '@/types/api/product/type';

interface EcommerceTemplateProps {
  categories: Category[];
  hoveredCategory: number | null;
  setHoveredCategory: (id: number | null) => void;
}

export default function EcommerceTemplate({
                                            categories,
                                            hoveredCategory,
                                            setHoveredCategory
                                          }: EcommerceTemplateProps) {
  return (
      <ul className="flex items-center space-x-6">
        {[
          {name: '全部商品', slug: '/search'},
          ...categories.slice(0, 5).map(cat => ({name: cat.name, slug: cat.slug ? `/category/${cat.slug}` : '#'}))
        ].map((item, index) => (
            <li key={index}>
              <a
                  className="text-nowrap relative text-neutral-500 before:absolute before:bottom-0 before:left-0 before:h-px before:w-0 before:bg-current before:transition-all before:duration-300 before:content-[''] hover:text-black hover:before:w-full dark:text-neutral-400 dark:hover:text-neutral-300 text-sm"
                  href={item.slug}
              >
                {item.name}
              </a>

              {/* 简单下拉菜单 */}
              {item.name !== '全部商品' && categories.find(c => c.name === item.name)?.children && (
                  <div
                      className={`absolute left-0 w-64 bg-white shadow-lg rounded-md border border-gray-200 z-50 transition-all duration-300 ${
                          hoveredCategory === index ? 'opacity-100 visible translate-y-2' : 'opacity-0 invisible -translate-y-2'
                      }`}
                      onMouseEnter={() => setHoveredCategory(index)}
                      onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <ul className="py-2">
                      {categories.find(c => c.name === item.name)?.children?.slice(0, 6).map((subCat: Category) => (
                          <li key={subCat.id}>
                            <a
                                href={subCat.slug ? `/category/${subCat.slug}` : '#'}
                                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            >
                              {subCat.name}
                            </a>
                          </li>
                      ))}
                    </ul>
                  </div>
              )}
            </li>
        ))}
      </ul>
  );
}