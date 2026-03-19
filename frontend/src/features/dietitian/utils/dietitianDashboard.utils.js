export const tabItems = ['Members', 'Appointments', 'Time Slots'];

export const mealSections = [
  { key: 'breakfast', title: 'Breakfast Options', icon: '🌅' },
  { key: 'lunch', title: 'Lunch Options', icon: '🌞' },
  { key: 'dinner', title: 'Dinner Options', icon: '🌙' },
  { key: 'snacks', title: 'Snacks Options', icon: '🍎' },
];

export const createMealOption = () => ({
  mealName: '',
  description: '',
  calories: '',
  protein: '',
  carbs: '',
  lipids: '',
  vitamins: '',
});

export const createDietPlanForm = () => ({
  breakfast: [createMealOption(), createMealOption(), createMealOption()],
  lunch: [createMealOption(), createMealOption(), createMealOption()],
  dinner: [createMealOption(), createMealOption(), createMealOption()],
  snacks: [createMealOption(), createMealOption(), createMealOption()],
  additionalNotes: '',
});

export const hasAnyMealName = (form) =>
  ['breakfast', 'lunch', 'dinner', 'snacks'].some((sectionKey) =>
    Array.isArray(form?.[sectionKey])
    && form[sectionKey].some((item) => String(item?.mealName || '').trim().length > 0),
  );

export const sanitizePlanSection = (section = []) =>
  (Array.isArray(section) ? section : []).map((item) => ({
    mealName: String(item?.mealName || '').trim(),
    description: String(item?.description || '').trim(),
    calories: item?.calories ?? '',
    protein: item?.protein ?? '',
    carbs: item?.carbs ?? '',
    lipids: item?.lipids ?? '',
    vitamins: String(item?.vitamins || '').trim(),
  }));

export const getNoteValue = (notes, key) => {
  if (!notes) return '';
  const pattern = new RegExp(`${key}:\\s*([^|]+)`, 'i');
  const match = notes.match(pattern);
  return match?.[1]?.trim() || '';
};

export const getWeekdayLabel = (isoDate) => {
  if (!isoDate) return '';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-US', { weekday: 'long' });
};

export const to12Hour = (time24) => {
  const [hoursRaw, minsRaw] = (time24 || '').split(':');
  const hours = Number(hoursRaw);
  const mins = Number(minsRaw);
  if (Number.isNaN(hours) || Number.isNaN(mins)) return '';
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const converted = hours % 12 || 12;
  return `${String(converted).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${suffix}`;
};
