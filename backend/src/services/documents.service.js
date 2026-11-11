const documentsRepository = require('../repositories/documents.repository');

function createDocument(file, owner) {
  const document = {
    id: file.filename,
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storagePath: file.path,
  };

  documentsRepository.create(document);
  return toPublicDocument(document);
}

function listDocuments(owner) {
  return documentsRepository.listByOwner(owner).map(toPublicDocument);
}

function findDocument(id, owner) {
  return documentsRepository.findByIdAndOwner(id, owner);
}

function toPublicDocument(document) {
  const { storagePath: _storagePath, ...publicDocument } = document;
  return publicDocument;
}

module.exports = {
  createDocument,
  findDocument,
  listDocuments,
};
