import s3 from '../config/aws/s3-aws-config';

const bucketName = process.env.S3_BUCKET_NAME;

// Upload de arquivo para o S3
export const uploadToS3 = async (fileBuffer, key, contentType) => {
    const params = {
        Bucket: bucketName,
        Key: key, // Caminho do arquivo no bucket
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'public-read', // Torna o arquivo público (ou use "private" para acesso restrito)
    };

    return await s3.upload(params).promise();
};

// Download de arquivo do S3
export const downloadFromS3 = async (key) => {
    const params = {
        Bucket: bucketName,
        Key: key,
    };

    const data = await s3.getObject(params).promise();
    return data.Body; // Retorna o buffer do arquivo
};

// Excluir arquivo do S3 (se necessário)
export const deleteFromS3 = async (key) => {
    const params = {
        Bucket: bucketName,
        Key: key,
    };

    return await s3.deleteObject(params).promise();
};
