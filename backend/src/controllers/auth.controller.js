const authService = require('../services/auth.service');
const sessionsService = require('../services/sessions.service');

const SESSION_COOKIE = 'dms_session';
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

function getSessionToken(req) {
  const cookies = req.headers.cookie?.split(';') || [];
  const sessionCookie = cookies.find((cookie) => cookie.trim().startsWith(`${SESSION_COOKIE}=`));
  if (!sessionCookie) return null;

  const token = sessionCookie.trim().slice(SESSION_COOKIE.length + 1);
  return /^[a-f0-9]{64}$/.test(token) ? token : null;
}

function sendAuthError(error, res, next) {
  if (!error.status) {
    next(error);
    return;
  }

  res.status(error.status).json({
    error: {
      code: error.code,
      message: error.message,
    },
  });
}

function setSessionCookie(res, session) {
  const maxAge = Math.max(0, session.expiresAt - Date.now());
  res.cookie(SESSION_COOKIE, session.token, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge,
  });
}

async function register(req, res, next) {
  try {
    const session = await authService.register(req.body?.username, req.body?.password);
    setSessionCookie(res, session);
    res.status(201).json(session.user);
  } catch (error) {
    sendAuthError(error, res, next);
  }
}

async function login(req, res, next) {
  try {
    const session = await authService.login(req.body?.username, req.body?.password);
    setSessionCookie(res, session);
    res.json(session.user);
  } catch (error) {
    sendAuthError(error, res, next);
  }
}

function currentUser(req, res, next) {
  const token = getSessionToken(req);
  const user = sessionsService.authenticate(token);
  if (!user) {
    res.status(401).json({
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Faça login para continuar.',
      },
    });
    return;
  }

  res.json({ username: user.username });
}

function logout(req, res) {
  sessionsService.endSession(getSessionToken(req));
  res.clearCookie(SESSION_COOKIE, SESSION_COOKIE_OPTIONS);
  res.status(204).end();
}

function requireAuthentication(req, res, next) {
  const token = getSessionToken(req);
  const user = sessionsService.authenticate(token);
  if (!user) {
    res.status(401).json({
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Faça login para continuar.',
      },
    });
    return;
  }

  req.user = user;
  next();
}

module.exports = {
  currentUser,
  login,
  logout,
  register,
  requireAuthentication,
};
