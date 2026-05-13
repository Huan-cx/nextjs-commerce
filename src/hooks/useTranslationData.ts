import {useLocale} from "next-intl";
import {I18nDataVO} from "@/types/api/product/type";
import {
  getTranslation,
  getTranslationDescription,
  getTranslationIntroduction,
  getTranslationKeyword,
  getTranslationName,
} from "@/utils/i18n/translation";

interface UseTranslationDataReturn {
  locale: string;
  getTranslation: (translations: I18nDataVO[] | undefined) => I18nDataVO | undefined;
  getName: (item: { translations?: I18nDataVO[] }, defaultValue: string) => string;
  getKeyword: (item: { translations?: I18nDataVO[] }, defaultValue: string) => string;
  getIntroduction: (item: { translations?: I18nDataVO[] }, defaultValue: string) => string;
  getDescription: (item: { translations?: I18nDataVO[] }, defaultValue: string) => string;
}

/**
 * 自定义 Hook，用于获取多语言翻译数据
 * 结合 next-intl 的 useLocale 获取当前语言，并提供便捷的翻译获取方法
 */
export function useTranslationData(): UseTranslationDataReturn {
  const locale = useLocale();

  /**
   * 获取完整的翻译对象
   */
  const getTranslationData = (translations: I18nDataVO[] | undefined): I18nDataVO | undefined => {
    return getTranslation(translations, locale);
  };

  /**
   * 获取翻译后的名称
   */
  const getName = (item: { translations?: I18nDataVO[] }, defaultValue: string): string => {
    return getTranslationName(item, locale, defaultValue);
  };

  /**
   * 获取翻译后的关键字
   */
  const getKeyword = (item: { translations?: I18nDataVO[] }, defaultValue: string): string => {
    return getTranslationKeyword(item, locale, defaultValue);
  };

  /**
   * 获取翻译后的简介
   */
  const getIntroduction = (item: { translations?: I18nDataVO[] }, defaultValue: string): string => {
    return getTranslationIntroduction(item, locale, defaultValue);
  };

  /**
   * 获取翻译后的描述
   */
  const getDescription = (item: { translations?: I18nDataVO[] }, defaultValue: string): string => {
    return getTranslationDescription(item, locale, defaultValue);
  };

  return {
    locale,
    getTranslation: getTranslationData,
    getName,
    getKeyword,
    getIntroduction,
    getDescription,
  };
}