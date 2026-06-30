export type CountryCode = "KR" | "US" | "KH" | "VN" | "NP";
export type LanguageName = "한국어" | "English" | "ខ្មែរ" | "Tiếng Việt" | "नेपाली";

export const DEFAULT_LANGUAGE: CountryCode = "KR";

export const LANGUAGE_OPTIONS: {
  countryCode: CountryCode;
  languageName: LanguageName;
}[] = [
  { countryCode: "KR", languageName: "한국어" },
  { countryCode: "US", languageName: "English" },
  { countryCode: "KH", languageName: "ខ្មែរ" },
  { countryCode: "VN", languageName: "Tiếng Việt" },
  { countryCode: "NP", languageName: "नेपाली" },
];

