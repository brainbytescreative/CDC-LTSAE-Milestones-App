// import milestoneChecklist from './milestoneChecklist.json!milestoneChecklist';

export const routeKeys = Object.freeze({
  OnboardingInfo: 'OnboardingInfo',
  OnboardingHowToUse: 'OnboardingHowToUse',
  OnboardingParentProfile: 'OnboardingParentProfile',
  Dashboard: 'Dashboard',
  AddChild: 'AddChild',
});

export const states = [
  'AL',
  'AK',
  'AS',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'DC',
  'FL',
  'GA',
  'GU',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'MP',
  'OH',
  'OK',
  'OR',
  'PA',
  'PR',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VI',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
] as const;

export type StateCode = typeof states[number];

export type Guardian = 'guardian' | 'healthcareProvider';

export const guardianTypes: ['guardian', 'healthcareProvider'] = ['guardian', 'healthcareProvider'];

export const skillTypes = ['cognitive', 'social', 'language', 'movement'];
export type SkillType = typeof skillTypes[number];

export const colors = Object.freeze({
  lightGreen: '#BCFDAC',
  purple: '#CEB9EF',
  iceCold: '#94F5EB',
  aquamarine: '#64FCD4',
  lightGray: '#E3E3E3',
  aquamarineTransparent: 'rgba(100, 252, 212, 0.28)',
});

export const childAges = [2, 4, 6, 9, 12, 18, 24, 36, 48, 60];
export type LanguageType = 'en' | 'es';
