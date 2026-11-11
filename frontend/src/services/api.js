const API_PREFIX = '/api';

async function ensureSuccess(response) {
  if (response.ok) return response;

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  throw new Error(payload?.error?.message || `Falha na solicitação (${response.status}).`);
}

async function request(path, options = {}) {
  const response = await fetch(`${API_PREFIX}${path}`, {
    credentials: 'same-origin',
    ...options,
  });
  return ensureSuccess(response);
}

export async function getCurrentUser() {
  const response = await fetch(`${API_PREFIX}/auth/me`, { credentials: 'same-origin' });
  if (response.status === 401) return null;
  return (await ensureSuccess(response)).json();
}

export async function authenticate(mode, username, password) {
  const response = await request(`/auth/${mode === 'register' ? 'register' : 'login'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return response.json();
}

export async function logout() {
  await request('/auth/logout', { method: 'POST' });
}

export async function listDocuments({ signal } = {}) {
  const response = await request('/documents', { signal });
  return response.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request('/upload', {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

export async function downloadDocument(documentId) {
  const response = await request(
    `/documents/${encodeURIComponent(documentId)}/download`,
  );
  return response.blob();
}