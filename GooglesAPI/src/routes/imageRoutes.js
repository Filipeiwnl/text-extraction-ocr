import express from 'express';
import { uploadRg,  uploadCnh } from '../middlewares/upload.js';
import analyzeImages from '../controllers/validationImage.js';
import analyzeImagesCnh from '../controllers/validationCnhimage.js';
const router = express.Router();

router.post('/analyze', uploadRg, analyzeImages);
router.post('/analyze/cnh', uploadCnh, analyzeImagesCnh);

export default router;
    