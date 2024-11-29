import client from '../config/googleConfig.js';
import fs from 'fs/promises';
import sharp from 'sharp';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';
import {
    getFieldValueAfterLabel,
    extractParents,
    extractNaturalidade,
} from './utils.js';

const CPF_REGEX = /(?:CPF|C\.?P\.?F\.?):?\s*(\d{3}\.\d{3}\.\d{3}-\d{2})/i;
const DATE_REGEX = /\b\d{2}\/\d{2}\/\d{4}\b/;
const RG_REGEX = /\b\d{2}\.\d{3}\.\d{3}-?\d?\b/;

const preprocessImage = async (imagePath, width = 800) => {
    const outputPath = `${imagePath}-processed.png`;
    await sharp(imagePath)
        .resize(width)
        .grayscale()
        .normalise()
        .sharpen()
        .toFile(outputPath);
    return outputPath;
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
        if (!req.files?.frontImage || !req.files?.backImage) {
            return res.status(400).json({ error: 'Imagens de frente e verso são obrigatórias.' });
        }

        const frontImagePath = req.files.frontImage[0].path;
        const backImagePath = req.files.backImage[0].path;

        const processedFront = await preprocessImage(frontImagePath);
        const processedBack = await preprocessImage(backImagePath);

        const [frontResult] = await client.textDetection(processedFront);
        const frontText = frontResult.textAnnotations?.[0]?.description || '';

        const [backResult] = await client.textDetection(processedBack);
        const backText = backResult.textAnnotations?.[0]?.description || '';

        if (!frontResult.textAnnotations || !backResult.textAnnotations) {
            return res.status(400).json({ error: 'Falha ao extrair texto das imagens.' });
        }

        console.log('OCR Resultado - Frente:', JSON.stringify(frontResult.textAnnotations, null, 2));
        console.log('OCR Resultado - Verso:', JSON.stringify(backResult.textAnnotations, null, 2));

        await fs.unlink(frontImagePath);
        await fs.unlink(backImagePath);
        await fs.unlink(processedFront);
        await fs.unlink(processedBack);

        const textLines = `${frontText}\n${backText}`.split('\n').map((line) => line.trim());
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
                frontText: frontText || 'Nenhum texto extraído',
                backText: backText || 'Nenhum texto extraído',
            },
        });
    } catch (error) {
        console.error('Erro ao processar as imagens:', error.message, error.stack);
        res.status(500).json({ error: 'Erro ao processar as imagens', details: error.message });
    }
};

export { analyzeImages };
