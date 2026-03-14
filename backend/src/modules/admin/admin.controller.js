export function getadminStatus(_req, res) {
  res.json({
    module: 'admin',
    status: 'ready',
  });
}
