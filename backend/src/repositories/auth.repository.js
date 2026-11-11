const users = new Map();
const sessions = new Map();

function findUserByUsername(username) {
  return users.get(username) || null;
}

function createUser(user) {
  if (users.has(user.username)) return false;
  users.set(user.username, user);
  return true;
}

function createSession(token, username, expiresAt) {
  sessions.set(token, { username, expiresAt });
}

function findUserBySession(token) {
  const session = sessions.get(token);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }

  return findUserByUsername(session.username);
}

function deleteSession(token) {
  sessions.delete(token);
}

module.exports = {
  createSession,
  createUser,
  deleteSession,
  findUserBySession,
  findUserByUsername,
};
