const assert = require('node:assert/strict');
const { once } = require('node:events');
const { randomUUID } = require('node:crypto');
const { rm } = require('node:fs/promises');
const path = require('node:path');
const { test } = require('node:test');
const app = require('../src/app');

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

async function startServer(t) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  return `http://127.0.0.1:${server.address().port}`;
}

function createClient(baseUrl) {
  let cookie = '';

  return {
    async request(resource, options = {}) {
      const headers = new Headers(options.headers || {});
      if (cookie) headers.set('Cookie', cookie);

      const response = await fetch(`${baseUrl}${resource}`, {
        ...options,
        headers,
      });
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        const cookiePair = setCookie.split(';', 1)[0];
        cookie = cookiePair.endsWith('=') ? '' : cookiePair;
      }

      return response;
    },
  };
}

function jsonRequest(method, body) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

test('rotas de documentos exigem uma sessão autenticada', async (t) => {
  const baseUrl = await startServer(t);
  const client = createClient(baseUrl);

  const response = await client.request('/documents');
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error.code, 'AUTHENTICATION_REQUIRED');
});

test('cadastro, login e titularidade isolam documentos entre usuários', async (t) => {
  const baseUrl = await startServer(t);
  const firstUser = createClient(baseUrl);
  const secondUser = createClient(baseUrl);
  const username = `user-${randomUUID().slice(0, 8)}`;
  const password = 'correct-horse-battery';
  let uploadedDocumentId;

  t.after(async () => {
    if (uploadedDocumentId && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(uploadedDocumentId)) {
      await rm(path.join(__dirname, '../storage', uploadedDocumentId), { force: true });
    }
  });

  const registration = await firstUser.request('/auth/register', jsonRequest('POST', { username, password }));
  assert.equal(registration.status, 201);
  assert.match(registration.headers.get('set-cookie'), /HttpOnly/i);
  assert.match(registration.headers.get('set-cookie'), /SameSite=Strict/i);
  assert.deepEqual(await registration.json(), { username });

  const duplicateRegistration = await firstUser.request('/auth/register', jsonRequest('POST', { username, password }));
  assert.equal(duplicateRegistration.status, 409);

  const formData = new FormData();
  formData.append('file', new Blob(['document contents'], { type: 'text/plain' }), 'notes.txt');
  const uploadResponse = await firstUser.request('/upload', { method: 'POST', body: formData });
  assert.equal(uploadResponse.status, 201);
  const uploadedDocument = await uploadResponse.json();
  uploadedDocumentId = uploadedDocument.id;
  assert.match(uploadedDocumentId, /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/);
  assert.equal(uploadedDocument.originalName, 'notes.txt');
  assert.equal(Object.hasOwn(uploadedDocument, 'storagePath'), false);

  const downloadResponse = await firstUser.request(
    `/documents/${encodeURIComponent(uploadedDocument.id)}/download`,
  );
  assert.equal(downloadResponse.status, 200);
  assert.equal(await downloadResponse.text(), 'document contents');

  const registrationForSecondUser = await secondUser.request(
    '/auth/register',
    jsonRequest('POST', { username: `other-${randomUUID().slice(0, 8)}`, password }),
  );
  assert.equal(registrationForSecondUser.status, 201);

  const secondUserDocuments = await secondUser.request('/documents', {
    headers: { 'X-User-Id': username },
  });
  assert.deepEqual(await secondUserDocuments.json(), []);

  const deniedDownload = await secondUser.request(
    `/documents/${encodeURIComponent(uploadedDocument.id)}/download`,
  );
  assert.equal(deniedDownload.status, 404);

  await secondUser.request('/auth/logout', { method: 'POST' });
  const afterLogout = await secondUser.request('/documents');
  assert.equal(afterLogout.status, 401);

  await firstUser.request('/auth/logout', { method: 'POST' });
  const login = await firstUser.request('/auth/login', jsonRequest('POST', { username, password }));
  assert.equal(login.status, 200);
  assert.deepEqual(await login.json(), { username });

  const firstUserDocuments = await firstUser.request('/documents');
  assert.equal((await firstUserDocuments.json()).length, 1);
});

test('login rejeita credenciais inválidas sem revelar se o usuário existe', async (t) => {
  const baseUrl = await startServer(t);
  const client = createClient(baseUrl);
  const response = await client.request(
    '/auth/login',
    jsonRequest('POST', { username: `missing-${randomUUID().slice(0, 8)}`, password: 'some-password-123' }),
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    error: {
      code: 'INVALID_CREDENTIALS',
      message: 'Usuário ou senha inválidos.',
    },
  });
});

test('limita tentativas de cadastro e login por endereço e rota', async (t) => {
  const baseUrl = await startServer(t);
  const client = createClient(baseUrl);
  let response;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    response = await client.request(
      '/auth/login',
      jsonRequest('POST', { username: 'unknown-user', password: 'some-password-123' }),
    );
  }

  assert.equal(response.status, 429);
  assert.ok(Number(response.headers.get('retry-after')) > 0);
});
