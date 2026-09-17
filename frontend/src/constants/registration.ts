export const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export const INTEREST_OPTIONS = [
  { value: 'culture_heritage', label: 'Culture & Heritage' },
  { value: 'durga_puja', label: 'Durga Puja' },
  { value: 'tourism', label: 'Tourism' },
  { value: 'business_investment', label: 'Business & Investment' },
  { value: 'education', label: 'Education' },
  { value: 'events_live', label: 'Events & Live' },
  { value: 'community_services', label: 'Community Services' },
  { value: 'others', label: 'Others' },
] as const;

export const PUJA_TYPE_OPTIONS = [
  { value: 'sarbojanin', label: 'Sarbojanin' },
  { value: 'barowari', label: 'Barowari' },
  { value: 'private', label: 'Private' },
] as const;

export const PUJA_CATEGORY_OPTIONS = [
  { value: 'traditional', label: 'Traditional' },
  { value: 'theme_based', label: 'Theme-based' },
  { value: 'heritage', label: 'Heritage' },
] as const;

export const COMMITTEE_COUNTRY_OPTIONS = [
  'India',
  'Bangladesh',
  'United Kingdom',
  'United States',
  'Canada',
  'United Arab Emirates',
  'Australia',
  'Other',
];

export const COMMITTEE_STATE_OPTIONS = ['West Bengal', 'Other'];

export function formatInterestLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatGenderLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
