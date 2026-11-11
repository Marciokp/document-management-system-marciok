const express = require('express');
const documentsController = require('../controllers/documents.controller');
const authController = require('../controllers/auth.controller');
const uploadMiddleware = require('../middleware/upload.middleware');

const router = express.Router();

router.post('/upload', authController.requireAuthentication, uploadMiddleware, documentsController.uploadDocument);
router.get('/documents', authController.requireAuthentication, documentsController.listDocuments);
router.get('/documents/:id/download', authController.requireAuthentication, documentsController.downloadDocument);

module.exports = router;
