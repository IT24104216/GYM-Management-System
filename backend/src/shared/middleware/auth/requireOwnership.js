import { normalizeRole } from '../../utils/roles.js';

const getValueByPath = (source, path) => {
  if (!source || !path) return '';
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), source);
};

export function requireOwnership(options = {}) {
  const {
    checks = [{ from: 'query', key: 'userId' }],
    allowRoles = ['admin'],
  } = options;

  return (req, res, next) => {
    const authUserId = String(req.user?.id || '');
    const role = normalizeRole(req.user?.role);
    const normalizedAllowRoles = allowRoles.map((item) => normalizeRole(item));

    if (!authUserId || !role) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (normalizedAllowRoles.includes(role)) {
      return next();
    }

    const hasMatchingOwner = checks.some((check) => {
      const from = String(check?.from || 'query');
      const key = String(check?.key || '');
      const source = from === 'params' ? req.params : from === 'body' ? req.body : req.query;
      const ownerId = String(getValueByPath(source, key) || '');
      return Boolean(ownerId) && ownerId === authUserId;
    });

    if (!hasMatchingOwner) {
      return res.status(403).json({ message: 'Forbidden: ownership mismatch' });
    }

    return next();
  };
}
