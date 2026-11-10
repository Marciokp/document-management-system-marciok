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

function userHeaders(userId) {
  return { 'X-User-Id': userId };
}

export async function listDocuments(userId) {
  const response = await ensureSuccess(await fetch(`${API_PREFIX}/documents`, {
    headers: userHeaders(userId),
  }));
  return response.json();
}

export async function uploadDocument(file, userId) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await ensureSuccess(await fetch(`${API_PREFIX}/upload`, {
    method: 'POST',
    headers: userHeaders(userId),
    body: formData,
  }));
  return response.json();
}

export async function downloadDocument(documentId, userId) {
  const response = await ensureSuccess(await fetch(
    `${API_PREFIX}/documents/${encodeURIComponent(documentId)}/download`,
    { headers: userHeaders(userId) },
  ));
  return response.blob();
}