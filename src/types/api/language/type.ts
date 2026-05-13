export interface AppLanguageRespVO {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isDefault: boolean;
}

export type LanguageListResponse = AppLanguageRespVO[];