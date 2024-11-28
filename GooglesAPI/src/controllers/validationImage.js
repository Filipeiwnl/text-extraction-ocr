import client from '../config/googleConfig.js';
import fs from 'fs/promises';
import sharp from 'sharp';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';
import { getFieldValueAfterLabel, extractParents, extractNaturalidade } from './utils.js'

// Regexes específicas
const CPF_REGEX = /(?:CPF|C\.?P\.?F\.?):?\s*(\d{3}\.\d{3}\.\d{3}-\d{2})/i;
const DATE_REGEX = /\b\d{2}\/\d{2}\/\d{4}\b/;
const RG_REGEX = /\b\d{2}\.\d{3}\.\d{3}-?\d?\b/;

// Pré-processamento da imagem do RG
const preprocessRgImage = async (imagePath) => {
    const outputPath = `${imagePath}-processed.png`;
    await sharp(imagePath)
        .resize(800) // Redimensiona para 800 pixels de largura
        .grayscale()
        .normalise()
        .sharpen()
        .toFile(outputPath);
    return outputPath;
};

// Extrai dados pessoais (nome, CPF, data de nascimento, RG)
const extractPersonalData = (textLines) => {
    const name = getFieldValueAfterLabel(textLines, 'nome');
    const cpf = textLines.find((line) => CPF_REGEX.test(line))?.match(CPF_REGEX)?.[1] || null;
    const cpfValid = cpf && cpfValidator.isValid(cpf) ? cpf : null;
    const birthDate = textLines.find((line) => DATE_REGEX.test(line))?.match(DATE_REGEX)?.[0] || null;
    const rg = textLines.find((line) => RG_REGEX.test(line))?.match(RG_REGEX)?.[0] || null;

    return { name, cpf: cpfValid, birthDate, rg };
};

// Controlador principal
const analyzeImages = async (req, res) => {
    try {
        if (!req.files?.frontImage || !req.files?.backImage) {
            return res.status(400).json({ error: 'Imagens de frente e verso são obrigatórias.' });
        }

        const frontImagePath = req.files.frontImage[0].path;
        const backImagePath = req.files.backImage[0].path;

        // Pré-processamento
        const processedFront = await preprocessRgImage(frontImagePath);
        const processedBack = await preprocessRgImage(backImagePath);

        // OCR nas imagens
        const [frontResult] = await client.textDetection(processedFront);
        const frontText = frontResult.textAnnotations?.[0]?.description || '';
        
        const [backResult] = await client.textDetection(processedBack);
        const backText = backResult.textAnnotations?.[0]?.description || '';
        console.log(frontResult); 
       // console.log(backResult);

        // Remove os arquivos temporários
        await fs.unlink(frontImagePath);
        await fs.unlink(backImagePath);
        await fs.unlink(processedFront);
        await fs.unlink(processedBack);

        // Divide o texto em linhas 
        const textLines = `${frontText}\n${backText}`.split('\n').map((line) => line.trim());

        // Extração de campos
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
        });
    } catch (error) {
        console.error('Erro ao processar as imagens:', error.message, error.stack); // Log do stack trace
        res.status(500).json({ error: 'Erro ao processar as imagens', details: error.message });
    }
};

export default analyzeImages;