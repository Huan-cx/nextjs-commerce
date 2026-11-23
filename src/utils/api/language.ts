import {get} from "@utils/request/request";
import {AppLanguageRespVO} from "@/types/language";

const defaultLanguages: AppLanguageRespVO[] = [
  {id: 1, code: "en-US", name: "English", nativeName: "English", flag: "🇺🇸", isDefault: true},
  {id: 2, code: "zh-CN", name: "中文", nativeName: "中文", flag: "🇨🇳", isDefault: false},
  {id: 3, code: "fr-FR", name: "Français", nativeName: "Français", flag: "🇫🇷", isDefault: false},
];

export async function getLanguageList(): Promise<AppLanguageRespVO[]> {
  try {
    return await get<AppLanguageRespVO[]>("i18n/language/list");
  } catch (error) {
    console.warn('Failed to fetch languages from server, using defaults:', error);
    return defaultLanguages;
  }
}