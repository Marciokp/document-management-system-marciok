const { randomUUID } = require('node:crypto');
const { mkdir } = require('node:fs');
const path = require('node:path');
const multer = require('multer');

const storageDirectory = path.resolve(__dirname, '../../storage');
const documents = new Map();
const configuredLimit = Number(process.env.MAX_UPLOAD_SIZE_BYTES);
const maxFileSize = Number.isSafeInteger(configuredLimit) && configuredLimit > 0
  ? configuredLimit
  : 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    mkdir(storageDirectory, { recursive: true }, (error) => {
      callback(error, storageDirectory);
    });
  },
  filename: (_req, _file, callback) => {
    callback(null, randomUUID());
  },
});

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: maxFileSize },
}).single('file');

function toPublicDocument(document) {
  const { storagePath: _storagePath, ...publicDocument } = document;
  return publicDocument;
}

function create(file, owner) {
  const document = {
    id: file.filename,
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storagePath: file.path,
  };

  documents.set(document.id, document);
  return toPublicDocument(document);
}

function listByOwner(owner) {
  return Array.from(documents.values())
    .filter((document) => document.owner === owner)
    .sort((first, second) => second.uploadedAt.localeCompare(first.uploadedAt))
    .map(toPublicDocument);
}

function findByIdAndOwner(id, owner) {
  const document = documents.get(id);
  return document?.owner === owner ? document : null;
}

module.exports = {
  create,
  findByIdAndOwner,
  listByOwner,
  uploadMiddleware,
};
