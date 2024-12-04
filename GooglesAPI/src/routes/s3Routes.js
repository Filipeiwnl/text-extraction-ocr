import express from 'express';
import { listObjectsFromS3, uploadToS3, downloadFromS3, deleteFromS3 } from '../services/s3Service.js';

const router = express.Router();

// Listar objetos
router.get('/list', async (req, res) => {
    try {
        const prefix = req.query.prefix || '';
        const objects = await listObjectsFromS3(prefix);
        res.json({
            message: 'Objetos listados com sucesso',
            data: objects.map(obj => ({
                key: obj.Key,
                size: obj.Size,
                lastModified: obj.LastModified,
                url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`,
            })),
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar objetos.', details: error.message });
    }
});

// Fazer upload
router.post('/upload', async (req, res) => {
    try {
        const { fileBuffer, fileName, contentType } = req.body;
        const key = `uploads/${Date.now()}-${fileName}`;
        const url = await uploadToS3(Buffer.from(fileBuffer, 'base64'), key, contentType);
        res.json({ message: 'Upload realizado com sucesso', url });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer upload.', details: error.message });
    }
});

// Download
router.get('/download/:key', async (req, res) => {
    try {
        const fileBuffer = await downloadFromS3(req.params.key);
        res.send(fileBuffer);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer download.', details: error.message });
    }
});

// Excluir
router.delete('/delete/:key', async (req, res) => {
    try {
        const message = await deleteFromS3(req.params.key);
        res.json({ message });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir arquivo.', details: error.message });
    }
});

export default router;
