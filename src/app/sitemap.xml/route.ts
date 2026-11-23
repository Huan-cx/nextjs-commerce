import {NextResponse} from 'next/server';
import {cachedRestGet} from '@/utils/request/useCahceRest';
import {BASE_URL} from '@/utils/constants';
import {routing} from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const SITE_URL = BASE_URL || 'https://nextjs.ruoyi.com';
const DEFAULT_LOCALE = routing.defaultLocale;
const LOCALES = routing.locales;

interface UrlEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: number;
  type: string;
  alternates: { hreflang: string; href: string }[];
}

async function fetchAllProducts() {
  const allProducts: { id: number; slug?: string; updateTime?: string }[] = [];
  const pageSize = 200;
  let pageNo = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const res = await cachedRestGet<any>('product', 'product/spu/page', {
        pageNo,
        pageSize,
      });
      const list = res?.list || [];
      allProducts.push(
          ...list.map((p: any) => ({
            id: p.id,
            slug: p.slug || String(p.id),
            updateTime: p.createTime,
          })),
      );
      const total = res?.total || 0;
      hasMore = pageNo * pageSize < total;
      pageNo++;
    } catch (e) {
      console.error('[Sitemap] Failed to fetch products page', pageNo, e);
      break;
    }
  }
  return allProducts;
}

function flattenCategories(categories: any[]): any[] {
  const result: any[] = [];
  for (const cat of categories) {
    result.push({
      id: cat.id,
      slug: cat.slug || String(cat.id),
      updateTime: cat.createTime,
    });
    if (cat.children && Array.isArray(cat.children)) {
      result.push(...flattenCategories(cat.children));
    }
  }
  return result;
}

async function fetchAllCategories() {
  try {
    const tree = await cachedRestGet<any[]>('category', 'product/category/tree');
    return flattenCategories(tree || []);
  } catch (e) {
    console.error('[Sitemap] Failed to fetch categories', e);
    return [];
  }
}

async function fetchAllArticles() {
  try {
    const footer = await cachedRestGet<any>('static', 'promotion/article/footer');
    const articles: any[] = [];
    (Object.values(footer || {}) as any[][]).forEach((column) => {
      if (Array.isArray(column)) {
        articles.push(
            ...column.map((a: any) => ({
              id: a.id,
              slug: a.slug || String(a.id),
              updateTime: a.createTime,
            })),
        );
      }
    });
    return articles;
  } catch (e) {
    console.error('[Sitemap] Failed to fetch articles', e);
    return [];
  }
}

function buildLocaleUrls(path: string, updateTime?: string, type: string = 'page'): UrlEntry[] {
  const urls: UrlEntry[] = [];
  const lastModified = updateTime ? new Date(updateTime).toISOString() : new Date().toISOString();

  for (const locale of LOCALES) {
    const url = `${SITE_URL}/${locale}${path}`;
    const alternates: { hreflang: string; href: string }[] = [];
    for (const l of LOCALES) {
      alternates.push({hreflang: l, href: `${SITE_URL}/${l}${path}`});
    }
    alternates.push({hreflang: 'x-default', href: `${SITE_URL}/${DEFAULT_LOCALE}${path}`});

    urls.push({
      loc: url,
      lastmod: lastModified,
      changefreq: 'weekly',
      priority: 0.7,
      type,
      alternates,
    });
  }
  return urls;
}

function escapeXml(str: string): string {
  return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
}

function buildXml(urls: UrlEntry[]): string {
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  lines.push('        xmlns:xhtml="http://www.w3.org/1999/xhtml/links">');

  for (const u of urls) {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(u.loc)}</loc>`);
    lines.push(`    <lastmod>${u.lastmod}</lastmod>`);
    lines.push(`    <changefreq>${u.changefreq}</changefreq>`);
    lines.push(`    <priority>${u.priority}</priority>`);
    lines.push(`    <type>${u.type}</type>`);
    for (const alt of u.alternates) {
      lines.push(`    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${escapeXml(alt.href)}" />`);
    }
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  return lines.join('\n');
}

export async function GET() {
  const [products, categories, articles] = await Promise.all([
    fetchAllProducts(),
    fetchAllCategories(),
    fetchAllArticles(),
  ]);

  const allUrls: UrlEntry[] = [];

  for (const locale of LOCALES) {
    allUrls.push({
      loc: `${SITE_URL}/${locale}`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: locale === DEFAULT_LOCALE ? 1 : 0.9,
      type: 'home',
      alternates: [],
    });
    allUrls.push({
      loc: `${SITE_URL}/${locale}/search`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.8,
      type: 'search',
      alternates: [],
    });
  }

  for (const p of products) {
    allUrls.push(...buildLocaleUrls(`/product/${p.slug}`, p.updateTime, 'product'));
  }

  for (const c of categories) {
    allUrls.push(...buildLocaleUrls(`/category/${c.slug}`, c.updateTime, 'category'));
  }

  for (const a of articles) {
    allUrls.push(...buildLocaleUrls(`/${a.slug}`, a.updateTime, 'article'));
  }

  const xml = buildXml(allUrls.slice(0, 49000));

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
