import client from '../config/googleConfig.js'; // Configuração do Document AI
import { GetObjectCommand } from '@aws-sdk/client-s3'; // Para baixar arquivos do S3
import s3 from '../config/aws/s3-aws-config.js'; // Cliente S3 configurado
import { getFieldValueAfterLabel, extractParents, extractNaturalidade } from './utils.js';
import { Buffer } from 'buffer';
import dotenv from 'dotenv'
dotenv.config()
const CPF_REGEX = /(?:CPF|C\.?P\.?F\.?):?\s*(\d{3}\.\d{3}\.\d{3}-\d{2})/i;
const DATE_REGEX = /\b\d{2}\/\d{2}\/\d{4}\b/;

// Função para baixar arquivos do S3
const downloadFromS3 = async (bucket, key) => {
    try {
        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        const response = await s3.send(command);

        // Converte o stream do S3 para buffer
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    } catch (error) {
        console.error('Erro ao baixar o arquivo do S3:', error.message);
        throw new Error('Erro ao baixar o arquivo do S3.');
    }
};

// Função para extrair a chave (key) de um objeto do S3 a partir da URL
const extractKeyFromUrl = (url, bucketName) => {
    const baseUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
    if (url.startsWith(baseUrl)) {
        return url.replace(baseUrl, '');
    }
    throw new Error('Chave do objeto S3 não pôde ser determinada a partir da URL.');
};

const extractPersonalData = (textLines) => {
    const name = getFieldValueAfterLabel(textLines, 'nome');
    const cpf = textLines.find((line) => CPF_REGEX.test(line))?.match(CPF_REGEX)?.[1] || null;
    const cpfValid = cpf && cpfValidator.isValid(cpf) ? cpf : null;
    const birthDate = textLines.find((line) => DATE_REGEX.test(line))?.match(DATE_REGEX)?.[0] || null;
    const rg = textLines.find((line) => RG_REGEX.test(line))?.match(RG_REGEX)?.[0] || null;

    return { name, cpf: cpfValid, birthDate, rg };
};

const analyzeImages = async (req, res) => {
    try {
        if (!req.s3Urls?.frontImage || !req.s3Urls?.backImage) {
            return res.status(400).json({ error: 'URLs das imagens são obrigatórias.' });
        }

        const bucketName = process.env.S3_BUCKET_NAME;

        // Extração das chaves dos arquivos no S3 a partir das URLs
        const frontKey = extractKeyFromUrl(req.s3Urls.frontImage, bucketName);
        const backKey = extractKeyFromUrl(req.s3Urls.backImage, bucketName);

        // Baixa os arquivos do S3
        const frontImageBuffer = await downloadFromS3(bucketName, frontKey);
        const backImageBuffer = await downloadFromS3(bucketName, backKey);

        // Função para processar o documento no Document AI
        const processDocument = async (fileBuffer) => {
            const fileContent = fileBuffer.toString('base64'); // Converte para base64
            const [result] = await client.processDocument({
                name: `projects/${process.env.PROJECT_ID}/locations/${process.env.REGION}/processors/${process.env.PROCESSOR_ID}`,
                rawDocument: {
                    content: fileContent,
                    mimeType: 'image/jpeg', // Ajuste conforme necessário
                },
            });
            return result.document;
        };
        

        // Processa as imagens com o Document AI
        const frontResult = await processDocument(frontImageBuffer);
        const backResult = await processDocument(backImageBuffer);

        // Valida os resultados
        if (!frontResult.text || !backResult.text) {
            return res.status(400).json({ error: 'Falha ao extrair texto das imagens.' });
        }

        // Processa o texto extraído
        const textLines = `${frontResult.text}\n${backResult.text}`.split('\n').map((line) => line.trim());
        const { name, cpf, birthDate, rg } = extractPersonalData(textLines);
        const parents = extractParents(textLines);
        const naturalidade = extractNaturalidade(textLines);

        res.json({
            message: 'Dados extraídos com sucesso',
            data: {
                name,
                cpf,
                birthDate,
                rg,
                parents,
                naturalidade,
            },
            source: {
                frontText: frontResult.text || 'Nenhum texto extraído',
                backText: backResult.text || 'Nenhum texto extraído',
            },
        });
    } catch (error) {
        console.error('Erro ao processar as imagens:', error.message, error.stack);
        res.status(500).json({ error: 'Erro ao processar as imagens', details: error.message });
    }
};

export default analyzeImages;
