// Language proficiency levels with hierarchy
export const LANGUAGE_LEVELS = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
  native: 7
} as const;

export type LanguageLevel = keyof typeof LANGUAGE_LEVELS;

/**
 * Check if a candidate's language level meets or exceeds the required level
 * @param candidateLevel - The candidate's proficiency level
 * @param requiredLevel - The minimum required proficiency level
 * @returns true if candidate meets or exceeds the requirement
 */
export function meetsLanguageRequirement(
  candidateLevel: string,
  requiredLevel: string
): boolean {
  const candidateScore = LANGUAGE_LEVELS[candidateLevel as LanguageLevel];
  const requiredScore = LANGUAGE_LEVELS[requiredLevel as LanguageLevel];

  // If either level is invalid, return false
  if (candidateScore === undefined || requiredScore === undefined) {
    return false;
  }

  return candidateScore >= requiredScore;
}

/**
 * Get all language level options for select dropdowns
 * @param compact - If true, returns short labels (e.g., "A1", "B2")
 */
export function getLanguageLevelOptions(compact: boolean = false) {
  if (compact) {
    return [
      { value: 'A1', label: 'A1' },
      { value: 'A2', label: 'A2' },
      { value: 'B1', label: 'B1' },
      { value: 'B2', label: 'B2' },
      { value: 'C1', label: 'C1' },
      { value: 'C2', label: 'C2' },
      { value: 'native', label: 'Native Speaker' }
    ];
  }
  
  return [
    { value: 'A1', label: 'A1 (Beginner)' },
    { value: 'A2', label: 'A2 (Elementary)' },
    { value: 'B1', label: 'B1 (Intermediate)' },
    { value: 'B2', label: 'B2 (Upper Intermediate)' },
    { value: 'C1', label: 'C1 (Advanced)' },
    { value: 'C2', label: 'C2 (Proficient)' },
    { value: 'native', label: 'Native Speaker' }
  ];
}

/**
 * Format language level for display
 */
export function formatLanguageLevel(level: string): string {
  const option = getLanguageLevelOptions(false).find(opt => opt.value === level);
  return option?.label || level;
}
