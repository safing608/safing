export const LANGUAGES = ["kr", "en", "kh", "vn", "np"] as const;

export type LanguageCode = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: LanguageCode = "kr";

export const LANGUAGE_OPTIONS: {
  countryCode: CountryCode;
  languageName: "한국어" | "English" | "ខ្មែរ" | "Tiếng Việt" | "नेपाली";
}[] = [
  { countryCode: "KR", languageName: "한국어" },
  { countryCode: "US", languageName: "English" },
  { countryCode: "KH", languageName: "ខ្មែរ" },
  { countryCode: "VN", languageName: "Tiếng Việt" },
  { countryCode: "NP", languageName: "नेपाली" },
];

export const COUNTRY_CODE_TO_LANGUAGE = {
  KR: "kr",
  US: "en",
  KH: "kh",
  VN: "vn",
  NP: "np",
} as const;

export type CountryCode = keyof typeof COUNTRY_CODE_TO_LANGUAGE;

export function isLanguageCode(value: string): value is LanguageCode {
  return (LANGUAGES as readonly string[]).includes(value);
}
