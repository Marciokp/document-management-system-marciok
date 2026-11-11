const attemptsByIpAndRoute = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const MAX_TRACKED_CLIENTS = 10000;

function authRateLimit(req, res, next) {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  let attempts = attemptsByIpAndRoute.get(key);

  if (!attempts && attemptsByIpAndRoute.size >= MAX_TRACKED_CLIENTS) {
    for (const [clientKey, clientAttempts] of attemptsByIpAndRoute) {
      if (clientAttempts.resetAt <= now) attemptsByIpAndRoute.delete(clientKey);
    }

    if (attemptsByIpAndRoute.size >= MAX_TRACKED_CLIENTS) {
      res.set('Retry-After', Math.ceil(WINDOW_MS / 1000));
      res.status(429).json({
        error: {
          code: 'TOO_MANY_AUTH_ATTEMPTS',
          message: 'Muitas tentativas. Aguarde antes de tentar novamente.',
        },
      });
      return;
    }
  }

  if (!attempts || attempts.resetAt <= now) {
    attempts = { count: 0, resetAt: now + WINDOW_MS };
    attemptsByIpAndRoute.set(key, attempts);
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    res.set('Retry-After', Math.ceil((attempts.resetAt - now) / 1000));
    res.status(429).json({
      error: {
        code: 'TOO_MANY_AUTH_ATTEMPTS',
        message: 'Muitas tentativas. Aguarde antes de tentar novamente.',
      },
    });
    return;
  }

  attempts.count += 1;
  next();
}

module.exports = authRateLimit;
