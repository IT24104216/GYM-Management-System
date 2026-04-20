export const dedupeNutritionItemsByName = (items = []) => {
  const seen = new Set();
  return (Array.isArray(items) ? items : []).filter((item) => {
    const key = String(item?.name || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const mergeNutritionResults = (localResults = [], externalResults = [], limit = 20) =>
  dedupeNutritionItemsByName([...(localResults || []), ...(externalResults || [])]).slice(0, limit);
