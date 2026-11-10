const documentsService = require('../services/documents.service');

function getOwner(req, res) {
  const owner = req.get('X-User-Id')?.trim();
  if (!owner) {
    res.status(400).json({
      error: {
        code: 'USER_ID_REQUIRED',
        message: 'Informe o usuário no header X-User-Id.',
      },
    });
    return null;
  }

  return owner;
}

function uploadDocument(req, res) {
  const owner = getOwner(req, res);
  if (!owner) return;

  if (!req.file) {
    res.status(400).json({
      error: {
        code: 'FILE_REQUIRED',
        message: 'Envie um arquivo no campo "file".',
      },
    });
    return;
  }

  res.status(201).json(documentsService.createDocument(req.file, owner));
}

function listDocuments(req, res) {
  const owner = getOwner(req, res);
  if (!owner) return;

  res.json(documentsService.listDocuments(owner));
}

function downloadDocument(req, res, next) {
  const owner = getOwner(req, res);
  if (!owner) return;

  const document = documentsService.findDocument(req.params.id, owner);
  if (!document) {
    res.status(404).json({
      error: {
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Documento não encontrado.',
      },
    });
    return;
  }

  res.download(document.storagePath, document.originalName, (error) => {
    if (error && !res.headersSent && error.code === 'ENOENT') {
      res.status(404).json({
        error: {
          code: 'DOCUMENT_FILE_NOT_FOUND',
          message: 'O arquivo do documento não está disponível.',
        },
      });
      return;
    }

    if (error) next(error);
  });
}

module.exports = {
  downloadDocument,
  listDocuments,
  uploadDocument,
  uploadMiddleware: documentsService.uploadMiddleware,
};
