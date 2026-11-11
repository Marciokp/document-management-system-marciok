const { randomUUID } = require('node:crypto');
const { mkdir } = require('node:fs');
const path = require('node:path');
const multer = require('multer');

const storageDirectory = path.resolve(__dirname, '../../storage');
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

module.exports = multer({
  storage,
  limits: { fileSize: maxFileSize },
}).single('file');
