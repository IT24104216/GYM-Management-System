export function getHealth(_req, res) {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
