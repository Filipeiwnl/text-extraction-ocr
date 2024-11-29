import multer from 'multer';
import multerS3 from 'multer-s3';
import s3 from '../config/aws/s3-aws-config.js'; // Cliente S3 configurado
import path from 'path';

// Configurações gerais
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB por arquivo
const ALLOWED_TYPES = /jpeg|jpg|png/;

// Filtro de arquivo
const fileFilter = (req, file, cb) => {
    const mimeType = ALLOWED_TYPES.test(file.mimetype);
    const extName = ALLOWED_TYPES.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extName) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens (JPEG, JPG, PNG) são permitidas.'));
    }
};

// Middleware para upload de arquivos ao S3
const uploadToS3 = multer({
    storage: multerS3({
        s3,
        bucket: process.env.S3_BUCKET_NAME, // Nome do bucket no S3
        acl: 'public-read', // Permite acesso público à URL do arquivo
        contentType: multerS3.AUTO_CONTENT_TYPE, // Detecta automaticamente o tipo do arquivo
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `uploads/${uniqueSuffix}-${file.originalname}`);
        },
    }),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter,
});

// Middleware para RG (frente e verso)
const upload = uploadToS3.fields([
    { name: 'frontImage', maxCount: 1 }, // Frente
    { name: 'backImage', maxCount: 1 }, // Verso
]);

// Middleware para CNH (apenas frente)
const uploadCnh = uploadToS3.fields([
    { name: 'frontImage', maxCount: 1 }, // Frente
]);

export { upload, uploadCnh };
