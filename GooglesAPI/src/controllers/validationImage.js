import client from '../config/googleConfig.js'; // Configuração do Document AI
import { downloadFromS3 } from '../services/s3Service.js'; // Serviço de download do S3
import { getFieldValueAfterLabel, extractParents, extractNaturalidade } from './utils.js';
import dotenv from 'dotenv';

dotenv.config();

const CPF_REGEX = /(?:CPF|C\.?P\.?F\.?):?\s*(\d{3}\.\d{3}\.\d{3}-\d{2})/i;
const DATE_REGEX = /\b\d{2}\/\d{2}\/\d{4}\b/;
const RG_REGEX = /\b\d{2}\.\d{3}\.\d{3}-?\d?\b/;

// Função para extrair a chave (key) de um objeto do S3 a partir da URL
const extractKeyFromUrl = (url, bucketName) => {
    const baseUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
    if (url.startsWith(baseUrl)) {
        return url.replace(baseUrl, '');
    }
    throw new Error('Chave do objeto S3 não pôde ser determinada a partir da URL.');
};

// Função para extrair dados pessoais
const extractPersonalData = (textLines) => {
    const name = getFieldValueAfterLabel(textLines, 'nome');
    const cpf = textLines.find((line) => CPF_REGEX.test(line))?.match(CPF_REGEX)?.[1] || null;
    const birthDate = textLines.find((line) => DATE_REGEX.test(line))?.match(DATE_REGEX)?.[0] || null;
    const rg = textLines.find((line) => RG_REGEX.test(line))?.match(RG_REGEX)?.[0] || null;

    return { name, cpf, birthDate, rg };
};

// Processar imagens e extrair dados
const analyzeImages = async (req, res) => {
    try {
        // Verificação de URLs do S3 fornecidas
        if (!req.s3Urls?.frontImage || !req.s3Urls?.backImage) {
            return res.status(400).json({ error: 'URLs das imagens são obrigatórias.' });
        }

        const bucketName = process.env.S3_BUCKET_NAME;

        // Extrair chaves das URLs do S3
        const frontKey = extractKeyFromUrl(req.s3Urls.frontImage, bucketName);
        const backKey = extractKeyFromUrl(req.s3Urls.backImage, bucketName);

        // Baixar arquivos do S3
        const frontImageBuffer = await downloadFromS3(frontKey);
        const backImageBuffer = await downloadFromS3(backKey);

        // Função para processar documentos no Google Document AI
        const processDocument = async (fileBuffer) => {
            const fileContent = fileBuffer.toString('base64'); // Converte para Base64
            const [result] = await client.processDocument({
            name: `projects/${process.env.PROJECT_ID}/locations/${process.env.REGION}/processors/${process.env.PROCESSOR_ID}`,
                rawDocument: {
                    content: fileContent,
                    mimeType: 'image/jpeg', // Ajustar conforme necessário
                },
            });
            return result.document;
        };

        // Processar imagens usando o Document AI
        const frontResult = await processDocument(frontImageBuffer);
        const backResult = await processDocument(backImageBuffer);

        // Verificar se os textos foram extraídos
        if (!frontResult.text || !backResult.text) {
            return res.status(400).json({ error: 'Falha ao extrair texto das imagens.' });
        }

        // Extrair linhas de texto e processar dados
        const textLines = `${frontResult.text}\n${backResult.text}`
            .split('\n')
            .map((line) => line.trim());

        const { name, cpf, birthDate, rg } = extractPersonalData(textLines);
        const parents = extractParents(textLines);
        const naturalidade = extractNaturalidade(textLines);

        // Retornar resposta com os dados extraídos
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
        res.status(500).json({
            error: 'Erro ao processar as imagens',
            details: error.message,
        });
    }
};

export default analyzeImages;
    