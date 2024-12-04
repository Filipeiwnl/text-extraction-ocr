import { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const bucketName = process.env.S3_BUCKET_NAME;

// Upload
export const uploadToS3 = async (fileBuffer, key, contentType) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
        };
        await s3.send(new PutObjectCommand(params));
        return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
        console.error('Erro ao fazer upload:', error.message);
        throw new Error('Erro ao fazer upload para o S3.');
    }
};

// Listar
export const listObjectsFromS3 = async (prefix = '') => {
    try {
        const params = {
            Bucket: bucketName,
            Prefix: prefix,
        };
        const response = await s3.send(new ListObjectsV2Command(params));
        return response.Contents || [];
    } catch (error) {
        console.error('Erro ao listar objetos:', error.message);
        throw new Error('Erro ao listar objetos no S3.');
    }
};

// Download
export const downloadFromS3 = async (key) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: key,
        };
        const response = await s3.send(new GetObjectCommand(params));
        const streamToBuffer = async (stream) => {
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        };
        return await streamToBuffer(response.Body);
    } catch (error) {
        console.error('Erro ao baixar arquivo:', error.message);
        throw new Error('Erro ao baixar arquivo do S3.');
    }
};

// Excluir
export const deleteFromS3 = async (key) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: key,
        };
        await s3.send(new DeleteObjectCommand(params));
        return `Arquivo ${key} excluído com sucesso.`;
    } catch (error) {
        console.error('Erro ao excluir arquivo:', error.message);
        throw new Error('Erro ao excluir arquivo do S3.');
    }
};
