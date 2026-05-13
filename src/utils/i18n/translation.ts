import {I18nDataVO} from "@/types/api/product/type";
import {I18nArticleVO} from "@/types/api/promotion/type";

// 通用翻译接口类型
type TranslationVO = I18nDataVO | I18nArticleVO;

/**
 * 根据当前语言获取翻译数据（精确匹配4位语言代码）
 * @param translations - 翻译数组
 * @param currentLang - 当前语言代码（如 zh-CN, en-US, fr-FR）
 * @returns 匹配的翻译对象，如未找到则返回 undefined
 */
export function getTranslation<T extends TranslationVO>(
    translations: T[] | undefined,
    currentLang: string
): T | undefined {
  if (!translations || translations.length === 0) {
    return undefined;
  }

  // 精确匹配4位语言代码（如 zh-CN === zh-CN）
  return translations.find(
      (t) => t.locale === currentLang
  );
}

/**
 * 获取翻译后的名称，如无翻译则使用默认值
 * @param item - 包含 translations 的对象
 * @param currentLang - 当前语言（4位代码，如 zh-CN）
 * @param defaultValue - 默认值（通常是对象的 name 字段）
 * @returns 翻译后的名称
 */
export function getTranslationName(
    item: { translations?: I18nDataVO[] },
    currentLang: string,
    defaultValue: string
): string {
  const translation = getTranslation(item.translations, currentLang);
  return translation?.name || defaultValue;
}

/**
 * 获取翻译后的关键字，如无翻译则使用默认值
 * @param item - 包含 translations 的对象
 * @param currentLang - 当前语言（4位代码，如 zh-CN）
 * @param defaultValue - 默认值
 * @returns 翻译后的关键字
 */
export function getTranslationKeyword(
    item: { translations?: I18nDataVO[] },
    currentLang: string,
    defaultValue: string
): string {
  const translation = getTranslation(item.translations, currentLang);
  return translation?.keyword || defaultValue;
}

/**
 * 获取翻译后的简介，如无翻译则使用默认值
 * @param item - 包含 translations 的对象
 * @param currentLang - 当前语言（4位代码，如 zh-CN）
 * @param defaultValue - 默认值
 * @returns 翻译后的简介
 */
export function getTranslationIntroduction(
    item: { translations?: I18nDataVO[] },
    currentLang: string,
    defaultValue: string
): string {
  const translation = getTranslation(item.translations, currentLang);
  return translation?.introduction || defaultValue;
}

/**
 * 获取翻译后的描述，如无翻译则使用默认值
 * @param item - 包含 translations 的对象
 * @param currentLang - 当前语言（4位代码，如 zh-CN）
 * @param defaultValue - 默认值
 * @returns 翻译后的描述
 */
export function getTranslationDescription(
    item: { translations?: I18nDataVO[] },
    currentLang: string,
    defaultValue: string
): string {
  const translation = getTranslation(item.translations, currentLang);
  return translation?.description || defaultValue;
}

/**
 * 获取翻译后的SEO标题，如无翻译则使用默认值
 * @param item - 包含 translations 的对象
 * @param currentLang - 当前语言（4位代码，如 zh-CN）
 * @param defaultValue - 默认值（通常是对象的 metaTitle 字段）
 * @returns 翻译后的SEO标题
 */
export function getTranslationMetaTitle(
    item: { translations?: TranslationVO[], metaTitle?: string },
    currentLang: string,
    defaultValue: string
): string {
  const translation = getTranslation(item.translations, currentLang);
  return translation?.metaTitle || item.metaTitle || defaultValue;
}

/**
 * 获取翻译后的SEO描述，如无翻译则使用默认值
 * @param item - 包含 translations 的对象
 * @param currentLang - 当前语言（4位代码，如 zh-CN）
 * @param defaultValue - 默认值（通常是对象的 metaDescription 字段）
 * @returns 翻译后的SEO描述
 */
export function getTranslationMetaDescription(
    item: { translations?: TranslationVO[], metaDescription?: string },
    currentLang: string,
    defaultValue: string
): string {
  const translation = getTranslation(item.translations, currentLang);
  return translation?.metaDescription || item.metaDescription || defaultValue;
}