const { promisify } = require('node:util');
const { randomBytes, scrypt: scryptCallback, timingSafeEqual } = require('node:crypto');

const scrypt = promisify(scryptCallback);
const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/;
const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 128;
const PASSWORD_HASH_LENGTH = 64;
const DUMMY_SALT = 'dms-login-timing-salt';
const DUMMY_HASH = Buffer.alloc(PASSWORD_HASH_LENGTH);

function normalizeUsername(username) {
  return typeof username === 'string' ? username.trim().toLowerCase() : '';
}

function validateRegistration(username, password) {
  if (!USERNAME_PATTERN.test(username)) {
    return {
      code: 'INVALID_USERNAME',
      message: 'Use um usuário de 3 a 32 caracteres: letras, números, ponto, hífen ou sublinhado.',
    };
  }

  if (typeof password !== 'string'
    || password.length < PASSWORD_MIN_LENGTH
    || password.length > PASSWORD_MAX_LENGTH) {
    return {
      code: 'INVALID_PASSWORD',
      message: 'A senha deve ter entre 12 e 128 caracteres.',
    };
  }

  return null;
}

async function createPasswordCredentials(password) {
  const salt = randomBytes(16).toString('hex');
  const passwordHash = await scrypt(password, salt, PASSWORD_HASH_LENGTH);
  return { salt, passwordHash };
}

async function verifyPassword(password, user) {
  if (typeof password !== 'string' || password.length > PASSWORD_MAX_LENGTH) {
    return false;
  }

  const passwordHash = await scrypt(
    password,
    user?.salt || DUMMY_SALT,
    PASSWORD_HASH_LENGTH,
  );
  const storedHash = user?.passwordHash || DUMMY_HASH;
  return timingSafeEqual(passwordHash, storedHash) && Boolean(user);
}

module.exports = {
  createPasswordCredentials,
  normalizeUsername,
  validateRegistration,
  verifyPassword,
};
