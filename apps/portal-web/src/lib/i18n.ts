import commonEn from '../../../../packages/i18n/locales/en/common.json';
import commonVi from '../../../../packages/i18n/locales/vi/common.json';
import patientEn from '../../../../packages/i18n/locales/en/patient.json';
import patientVi from '../../../../packages/i18n/locales/vi/patient.json';
import caseEn from '../../../../packages/i18n/locales/en/case.json';
import caseVi from '../../../../packages/i18n/locales/vi/case.json';
import workflowEn from '../../../../packages/i18n/locales/en/workflow.json';
import workflowVi from '../../../../packages/i18n/locales/vi/workflow.json';
import annotationEn from '../../../../packages/i18n/locales/en/annotation.json';
import annotationVi from '../../../../packages/i18n/locales/vi/annotation.json';
import medicalEn from '../../../../packages/i18n/locales/en/medical.json';
import medicalVi from '../../../../packages/i18n/locales/vi/medical.json';

export type Locale = 'vi' | 'en';

const translations: Record<Locale, Record<string, string>> = {
  en: { ...commonEn, ...patientEn, ...caseEn, ...workflowEn, ...annotationEn, ...medicalEn },
  vi: { ...commonVi, ...patientVi, ...caseVi, ...workflowVi, ...annotationVi, ...medicalVi },
};

export function t(key: string, locale: Locale = 'vi', params?: Record<string, string>): string {
  let value = translations[locale]?.[key] || translations['en']?.[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{${k}}`, v);
    });
  }
  return value;
}

export function getTranslations(locale: Locale) {
  return translations[locale] || translations['en'];
}
