export function getworkoutsStatus(_req, res) {
  res.json({
    module: 'workouts',
    status: 'ready',
  });
}
