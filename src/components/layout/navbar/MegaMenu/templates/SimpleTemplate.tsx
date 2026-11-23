import type {Category} from '@/types/api/product/type';

interface SimpleTemplateProps {
  categories: Category[];
}

export default function SimpleTemplate({categories}: SimpleTemplateProps) {
  return (
      <ul className="flex items-center space-x-6 text-sm">
        {[
          {name: '首页', slug: '/'},
          {name: '全部分类', slug: '/search'},
          ...categories.slice(0, 4).map(cat => ({name: cat.name, slug: cat.slug ? `/category/${cat.slug}` : '#'}))
        ].map((item, index) => (
            <li key={index}>
              <a
                  href={item.slug}
                  className="text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-neutral-300"
              >
                {item.name}
              </a>
            </li>
        ))}
      </ul>
  );
}