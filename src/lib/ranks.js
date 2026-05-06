export const RANK_KEYS = [
  'POPE',
  'BISHOP',
  'METROPOLITAN',
  'GENERAL_BISHOP',
  'HEGUMEN',
  'PRIEST',
  'DEACON',
  'MONK',
  'ABBOT',
];

export function getRankOptions(t) {
  return RANK_KEYS.map((key) => ({
    value: key,
    label: t(`ranks.${key}`),
  }));
}

export function getRankLabel(t, rank) {
  if (!rank) return '';
  return t(`ranks.${rank}`, { defaultValue: rank });
}
