const authRepository = require('../repositories/auth.repository');
const credentialsService = require('./credentials.service');
const sessionsService = require('./sessions.service');

function createAuthError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function register(usernameInput, password) {
  const username = credentialsService.normalizeUsername(usernameInput);
  const validationError = credentialsService.validateRegistration(username, password);
  if (validationError) {
    throw createAuthError(400, validationError.code, validationError.message);
  }

  if (authRepository.findUserByUsername(username)) {
    throw createAuthError(409, 'USERNAME_TAKEN', 'Esse usuário já está cadastrado.');
  }

  const passwordCredentials = await credentialsService.createPasswordCredentials(password);
  const user = { username, ...passwordCredentials };

  if (!authRepository.createUser(user)) {
    throw createAuthError(409, 'USERNAME_TAKEN', 'Esse usuário já está cadastrado.');
  }

  return sessionsService.createSession(username);
}

async function login(usernameInput, password) {
  const username = credentialsService.normalizeUsername(usernameInput);
  const user = authRepository.findUserByUsername(username);

  if (!await credentialsService.verifyPassword(password, user)) {
    throw createAuthError(401, 'INVALID_CREDENTIALS', 'Usuário ou senha inválidos.');
  }

  return sessionsService.createSession(username);
}

module.exports = {
  login,
  register,
};
