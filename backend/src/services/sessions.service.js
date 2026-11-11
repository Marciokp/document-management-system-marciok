const { randomBytes } = require('node:crypto');
const authRepository = require('../repositories/auth.repository');

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function createSession(username) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_TTL_MS;
  authRepository.createSession(token, username, expiresAt);
  return { token, user: { username }, expiresAt };
}

function authenticate(token) {
  return typeof token === 'string' ? authRepository.findUserBySession(token) : null;
}

function endSession(token) {
  if (typeof token === 'string') authRepository.deleteSession(token);
}

module.exports = {
  authenticate,
  createSession,
  endSession,
};
