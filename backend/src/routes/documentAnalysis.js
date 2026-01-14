// LOCATION: backend/src/routes/documentAnalysis.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const documentAnalysisController = require('../controllers/documentAnalysisController');
const auth = require('../middleware/auth');

// ensure upload folder exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  }
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

const upload = multer({ storage, fileFilter });

router.post(
  '/upload',
  auth(),
  upload.single('document'),
  documentAnalysisController.uploadDocument
);
router.post('/analyze/:id', auth(), documentAnalysisController.analyzeDocument);
router.get('/', auth(), documentAnalysisController.getDocuments);

module.exports = router;
