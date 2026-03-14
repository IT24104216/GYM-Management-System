export function getnotificationsStatus(_req, res) {
  res.json({
    module: 'notifications',
    status: 'ready',
  });
}
