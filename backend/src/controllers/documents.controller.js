const documentsService = require('../services/documents.service');

function uploadDocument(req, res) {
  if (!req.file) {
    res.status(400).json({
      error: {
        code: 'FILE_REQUIRED',
        message: 'Envie um arquivo no campo "file".',
      },
    });
    return;
  }

  res.status(201).json(documentsService.createDocument(req.file, req.user.username));
}

function listDocuments(req, res) {
  res.json(documentsService.listDocuments(req.user.username));
}

function downloadDocument(req, res, next) {
  const document = documentsService.findDocument(req.params.id, req.user.username);
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
};
