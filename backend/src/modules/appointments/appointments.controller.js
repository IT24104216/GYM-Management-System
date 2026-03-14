export function getappointmentsStatus(_req, res) {
  res.json({
    module: 'appointments',
    status: 'ready',
  });
}
