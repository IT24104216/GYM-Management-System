export function getauthStatus(_req, res) {
  res.json({
    module: 'auth',
    status: 'ready',
  });
}
