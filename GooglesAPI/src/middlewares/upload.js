import multer from 'multer';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Configurações S3
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.S3_BUCKET_NAME;

const s3 = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

// Configurações gerais do multer
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB por arquivo
const ALLOWED_TYPES = /jpeg|jpg|png/;

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const mimeType = ALLOWED_TYPES.test(file.mimetype);
        const extName = ALLOWED_TYPES.test(path.extname(file.originalname).toLowerCase());

        if (mimeType && extName) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens (JPEG, JPG, PNG) são permitidas.'));
        }
    }
    })

    const uploadToS3 = async (file, folder = 'uploads') => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const key = `${folder}/${uniqueSuffix}-${file.originalname}`;
    
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'private', 
        };
    
        try {
            console.log(`Iniciando upload para S3: ${key}`);
            const command = new PutObjectCommand(params);
            await s3.send(command);
            console.log(`Upload bem-sucedido: ${key}`);
            return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
        } catch (error) {
            console.error('Erro ao fazer upload para o S3:', error.message);
            throw new Error('Erro ao fazer upload para o S3.');
        }
    };
    

// Middleware para upload de RG (frente e verso)
const uploadRg = async (req, res, next) => {
    upload.fields([
        { name: 'frontImage', maxCount: 1 },
        { name: 'backImage', maxCount: 1 },
    ])(req, res, async (err) => {
        if (err) {
            console.error('Erro no upload de imagens:', err.message);
            return res.status(400).json({ error: err.message });
        }

        try {
            if (!req.files?.frontImage || !req.files?.backImage) {
                throw new Error('Imagens de frente e verso são obrigatórias.');
            }

            req.s3Urls = {
                frontImage: await uploadToS3(req.files.frontImage[0]),
                backImage: await uploadToS3(req.files.backImage[0]),
            };

            console.log('URLs do S3:', req.s3Urls);
            next();
        } catch (error) {
            console.error('Erro ao processar upload de RG:', error.message);
            res.status(500).json({ error: 'Erro ao enviar imagens para o S3.', details: error.message });
        }
    });
};
/*
// Middleware para upload de CNH (apenas frente)
const uploadCnh = async (req, res, next) => {
    upload.fields([{ name: 'frontImage', maxCount: 1 }])(req, res, async (err) => {
        if (err) {
            console.error('Erro no upload da imagem:', err.message);
            return res.status(400).json({ error: err.message });
        }

        try {
            if (!req.files?.frontImage) {
                throw new Error('Imagem da frente é obrigatória.');
            }

            req.s3Urls = {
                frontImage: await uploadToS3(req.files.frontImage[0]),
            };

            console.log('URL do S3:', req.s3Urls);
            next();
        } catch (error) {
            console.error('Erro ao processar upload de CNH:', error.message);
            res.status(500).json({ error: 'Erro ao enviar imagem para o S3.', details: error.message });
        }
    });
};*/

export default uploadRg ;
