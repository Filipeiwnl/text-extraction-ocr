const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const analyzeImages = require('../controllers/validationImage');

router.post('/analyze', upload, analyzeImages);

module.exports = router;
