const documents = new Map();

function create(document) {
  documents.set(document.id, document);
  return document;
}

function listByOwner(owner) {
  return Array.from(documents.values())
    .filter((document) => document.owner === owner)
    .sort((first, second) => second.uploadedAt.localeCompare(first.uploadedAt));
}

function findByIdAndOwner(id, owner) {
  const document = documents.get(id);
  return document?.owner === owner ? document : null;
}

module.exports = {
  create,
  findByIdAndOwner,
  listByOwner,
};
