import { parseCookies } from '../../common/cookies.js';
import { verifyAccessToken } from '../../common/jwt.js';

function extractToken(req, cookieName) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length);
  }

  if (!cookieName) {
    return null;
  }

  const cookies = parseCookies(req.headers.cookie);
  return cookies[cookieName] || null;
}

function attachUser(req, payload) {
  req.user = {
    userId: payload.sub,
    email: payload.email,
    tokenId: payload.jti,
    issuer: payload.iss,
    audience: payload.aud
  };
}

export function createApiAuthMiddleware(expectedAudience, options = {}) {
  return async function apiAuthMiddleware(req, res, next) {
    try {
      const token = extractToken(req, options.cookieName);
      if (!token) {
        return res.status(401).json({ error: 'Missing bearer token.' });
      }

      const { payload } = await verifyAccessToken(token, expectedAudience);
      attachUser(req, payload);
      return next();
    } catch (_error) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
  };
}

export function createPageAuthMiddleware(expectedAudience, options = {}) {
  return async function pageAuthMiddleware(req, res, next) {
    const token = extractToken(req, options.cookieName);
    if (!token) {
      return res.redirect(options.redirectTo || '/login');
    }

    try {
      const { payload } = await verifyAccessToken(token, expectedAudience);
      attachUser(req, payload);
      return next();
    } catch (_error) {
      return res.redirect(options.redirectTo || '/login');
    }
  };
}

export function createOptionalAuthMiddleware(expectedAudience, options = {}) {
  return async function optionalAuthMiddleware(req, _res, next) {
    const token = extractToken(req, options.cookieName);
    if (!token) {
      return next();
    }

    try {
      const { payload } = await verifyAccessToken(token, expectedAudience);
      attachUser(req, payload);
    } catch (_error) {
      req.user = null;
    }

    return next();
  };
}
