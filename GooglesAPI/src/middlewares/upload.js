import multer from 'multer';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();


const region = process.env.AWS_REGION
const accessKeyId =  process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
console.log(region)
// Configuração do cliente S3
const s3 = new S3Client({
    region: region, 
    credentials: {
        accessKeyId: accessKeyId, // Chave de acesso no .env
        secretAccessKey: secretAccessKey, // Chave secreta no .env
    },
});

// Configurações gerais
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB por arquivo
const ALLOWED_TYPES = /jpeg|jpg|png/;

// Configuração do multer para armazenar arquivos na memória
const storage = multer.memoryStorage();

// Configuração do multer para validar o arquivo
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
    },
});

// Função para enviar arquivos para o S3
const uploadToS3 = async (file, folder = 'uploads') => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const key = `${folder}/${uniqueSuffix}-${file.originalname}`;

    const params = {
        Bucket: process.env.S3_BUCKET_NAME, // Bucket definido no .env
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
        return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
        console.error('Erro ao fazer upload para o S3:', error.message);
        throw new Error('Erro ao fazer upload para o S3');
    }
};

// Middleware para RG (frente e verso)
const uploadRg = async (req, res, next) => {
    try {
        await upload.fields([
            { name: 'frontImage', maxCount: 1 },
            { name: 'backImage', maxCount: 1 },
        ])(req, res, async (err) => {
            if (err) {
                console.error('Erro no upload:', err.message);
                return res.status(400).json({ error: err.message });
            }

            if (req.files) {
                try {
                    // Verifica se os arquivos estão presentes
                    if (!req.files.frontImage || !req.files.backImage) {
                        throw new Error('Imagens de frente e verso são obrigatórias.');
                    }

                    // Confirma o upload para o S3
                    req.s3Urls = {
                        frontImage: await uploadToS3(req.files.frontImage[0]),
                        backImage: await uploadToS3(req.files.backImage[0]),
                    };

                    console.log('URLs do S3:', req.s3Urls);
                    next();
                } catch (uploadError) {
                    console.error('Erro ao enviar imagens para o S3:', uploadError.message);
                    res.status(500).json({ error: 'Erro ao enviar imagens para o S3.' });
                }
            } else {
                res.status(400).json({ error: 'Arquivos não enviados.' });
            }
        });
    } catch (error) {
        console.error('Erro no middleware de upload RG:', error.message);
        res.status(500).json({ error: 'Erro no upload das imagens do RG.' });
    }
};

// Middleware para CNH (apenas frente)
const uploadCnh = async (req, res, next) => {
    try {
        await upload.fields([{ name: 'frontImage', maxCount: 1 }])(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            if (req.files) {
                try {
                    req.s3Urls = {
                        frontImage: await uploadToS3(req.files.frontImage[0]),
                    };
                    next();
                } catch (uploadError) {
                    console.error('Erro ao enviar a imagem da CNH para o S3:', uploadError.message);
                    res.status(500).json({ error: 'Erro ao enviar a imagem da CNH para o S3.' });
                }
            }
        });
    } catch (error) {
        console.error('Erro no middleware de upload CNH:', error.message);
        res.status(500).json({ error: 'Erro no upload da imagem da CNH.' });
    }
};

export { uploadRg, uploadCnh };
