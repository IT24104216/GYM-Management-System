import { sectionMap, toNumber } from './mealPlans.service.js';

export const buildSectionData = (plan) => sectionMap.map((section) => {
  const rawItems = Array.isArray(plan[section.key]) ? plan[section.key] : [];
  const items = rawItems
    .filter((item) => String(item?.mealName || '').trim().length > 0)
    .map((item) => ({
      name: item.mealName,
      description: item.description || '',
      cals: toNumber(item.calories),
      p: toNumber(item.protein),
      c: toNumber(item.carbs),
      f: toNumber(item.lipids),
      vitamins: item.vitamins || '',
      quantity: toNumber(item.quantity) > 0 ? toNumber(item.quantity) : 1,
      unit: String(item.unit || 'g'),
    }));

  return {
    key: section.key,
    type: section.label,
    items,
    total: items.reduce((sum, item) => sum + item.cals, 0),
  };
});

export const buildDietPlanSummary = (sectionData) => sectionData.reduce(
  (acc, section) => {
    section.items.forEach((item) => {
      acc.totalCalories += item.cals;
      acc.protein += item.p;
      acc.carbs += item.c;
      acc.fat += item.f;
    });
    return acc;
  },
  { totalCalories: 0, protein: 0, carbs: 0, fat: 0 },
);

export const mapActiveUserDietPlan = (plan, dietitianUser, dietitianProfile) => {
  const sectionData = buildSectionData(plan);
  const summary = buildDietPlanSummary(sectionData);

  return {
    planId: String(plan._id),
    userId: String(plan.userId),
    memberName: plan.memberName || '',
    additionalNotes: plan.additionalNotes || '',
    isSubmitted: Boolean(plan.isSubmitted),
    submittedAt: plan.submittedAt,
    updatedAt: plan.updatedAt,
    dietitian: {
      id: String(plan.dietitianId),
      name: dietitianUser?.name || 'Dietitian',
      email: dietitianUser?.email || '',
      specialization: dietitianProfile?.specialization || 'Nutrition',
      experienceYears: Number(dietitianProfile?.experienceYears || 0),
    },
    summary,
    sections: sectionData,
  };
};

export const mapLocalNutritionRows = (rows) => rows.map((item) => ({
  source: item.source || 'local-db',
  id: String(item._id),
  name: String(item.name || '').trim(),
  calories: Number(item.calories || 0),
  protein: Number(item.protein || 0),
  carbs: Number(item.carbs || 0),
  fat: Number(item.fat || 0),
  notes: '',
  vitamins: '',
})).filter((item) => item.name);

export const mapUsdaFoods = (foods) => (foods || []).map((food) => {
  const nutrients = Array.isArray(food.foodNutrients) ? food.foodNutrients : [];
  const getNutrient = (names) => {
    const hit = nutrients.find((n) =>
      names.some((name) => String(n?.nutrientName || '').toLowerCase() === name.toLowerCase()));
    return Number(hit?.value || 0);
  };

  return {
    source: 'usda',
    id: String(food.fdcId || ''),
    name: String(food.description || '').trim(),
    calories: getNutrient(['Energy', 'Energy (Atwater General Factors)', 'Energy (Atwater Specific Factors)']),
    protein: getNutrient(['Protein']),
    carbs: getNutrient(['Carbohydrate, by difference']),
    fat: getNutrient(['Total lipid (fat)']),
    notes: '',
    vitamins: '',
  };
}).filter((item) => item.name);
