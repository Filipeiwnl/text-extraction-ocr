import express from 'express';
import upload from '../middlewares/upload.js';
import analyzeImages from '../controllers/validationImage.js';

const router = express.Router();

router.post('/analyze', upload, analyzeImages);

export default router;
    