"use client";

import {useQuery} from "@tanstack/react-query";
import {getLanguageList} from "@/utils/api/language";
import {AppLanguageRespVO} from "@/types/language";

const defaultLanguages: AppLanguageRespVO[] = [
  {id: 1, code: "en-US", name: "English", nativeName: "English", flag: "🇺🇸", isDefault: true},
  {id: 2, code: "zh-CN", name: "中文", nativeName: "中文", flag: "🇨🇳", isDefault: false},
  {id: 3, code: "fr-FR", name: "Français", nativeName: "Français", flag: "🇫🇷", isDefault: false},
];

export function useLanguageList() {
  const {data, error, isLoading} = useQuery<AppLanguageRespVO[]>({
    queryKey: ["languageList"],
    queryFn: async () => {
      const response = await getLanguageList();
      return response.length > 0 ? response : defaultLanguages;
    },
    staleTime: 24 * 60 * 60 * 1000,
  });

  const languages: AppLanguageRespVO[] = data || defaultLanguages;

  return {
    languages,
    error,
    isLoading,
    defaultLanguage: languages.find(lang => lang.isDefault) || defaultLanguages[0],
    languageCodes: languages.map(lang => lang.code),
  };
}