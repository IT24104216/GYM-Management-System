export function getmealPlansStatus(_req, res) {
  res.json({
    module: 'mealPlans',
    status: 'ready',
  });
}
