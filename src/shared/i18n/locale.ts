import type { Locale } from "antd/es/locale";
import enUS from "antd/locale/en_US";
import esES from "antd/locale/es_ES";
import dayjs from "dayjs";
import moment from "moment";

import type { Language } from "../contexts/language.context";

import "dayjs/locale/es";
import "moment/locale/es";

export const getAntdLocale = (language: Language): Locale => {
  return language === "spanish" ? esES : enUS;
};

export const getDayjsLocale = (language: Language): string => {
  return language === "spanish" ? "es" : "en";
};

export const getIntlLocale = (language: Language): string => {
  return language === "spanish" ? "es-CO" : "en-US";
};

export const getHtmlLang = (language: Language): string => {
  return language === "spanish" ? "es" : "en";
};

export const applyDateLibraryLocale = (language: Language): void => {
  const locale = getDayjsLocale(language);
  dayjs.locale(locale);
  moment.locale(locale);
};

