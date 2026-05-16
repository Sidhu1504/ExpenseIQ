const express = require('express');
const router = express.Router();
const multer = require('multer');
const ocrController = require('../controllers/ocr.controller');
const verifyToken = require('../middlewares/auth.middleware');

// Configure Multer to keep the file in memory
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(verifyToken);

// POST /api/ocr/scan
// Expects form-data with a key named 'receipt' containing the image file
router.post('/scan', upload.single('receipt'), ocrController.scanReceipt);

module.exports = router;
