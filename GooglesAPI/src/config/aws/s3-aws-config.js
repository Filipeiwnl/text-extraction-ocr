import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do cliente S3
const s3 = new S3Client({
    region: process.env.AWS_REGION, // Região do bucket
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Chave de acesso do IAM
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Chave secreta do IAM
    },
});

export default s3;
