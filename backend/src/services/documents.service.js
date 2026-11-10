const documentsRepository = require('../repositories/documents.repository');

function createDocument(file, owner) {
  return documentsRepository.create(file, owner);
}

function listDocuments(owner) {
  return documentsRepository.listByOwner(owner);
}

function findDocument(id, owner) {
  return documentsRepository.findByIdAndOwner(id, owner);
}

module.exports = {
  createDocument,
  findDocument,
  listDocuments,
  uploadMiddleware: documentsRepository.uploadMiddleware,
};
