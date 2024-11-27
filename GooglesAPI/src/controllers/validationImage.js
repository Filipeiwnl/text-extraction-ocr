import client from '../config/googleConfig.js';
import fs from 'fs/promises';
import sharp from 'sharp';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';

// Regexes específicas
const regexCpf = /(?:CPF|C\.?P\.?F\.?):?\s*(\d{3}\.\d{3}\.\d{3}-\d{2})/i;
const regexDate = /\b\d{2}\/\d{2}\/\d{4}\b/; // datas no formato DD/MM/YYYY
const regexRg = /\b\d{2}\.\d{3}\.\d{3}-?\d?\b/; // RG no formato XX.XXX.XXX-X
//TODO  verificar o pq a naturalidade nao esta sendo extraida corretamente
// preprocessamento da imagem
const preprocessImage = async (imagePath) => {
    const outputPath = `${imagePath}-processed.png`;
    await sharp(imagePath)
        .resize(1200)
        .grayscale()
        .normalise()
        .sharpen()
        .toFile(outputPath);
    return outputPath;
};

// Função para buscar por linhas próximas
const getFieldNearLabel = (textLines, label, offset = 1) => {
    const index = textLines.findIndex((line) => line.toLowerCase().includes(label.toLowerCase()));
    if (index !== -1 && index + offset < textLines.length) {
        return textLines[index + offset].trim();
    }
    return null;
};

// funcai para pegar filiação
const extractParents = (textLines) => {
    const parentsIndex = textLines.findIndex((line) =>
        line.toLowerCase().includes('filiação')
    );
    if (parentsIndex !== -1) {
        const parentLines = textLines.slice(parentsIndex + 1, parentsIndex + 3); // pega as duas linhas seguintes
        return parentLines.join(' ').trim(); // Une os nomes em uma so string
    }
    return null;
};

const extractNaturalidade = (textLines) => {
    const naturalidadeLine = textLines.find((line) =>
        line.toLowerCase().includes('naturalidade')
    );
    if (naturalidadeLine) {
        return naturalidadeLine.replace(/.*naturalidade:?\s*/i, '').trim();
    }
    return null;
};

// Controlador principal
const analyzeImages = async (req, res) => {
    try {
        if (!req.files?.frontImage || !req.files?.backImage) {
            return res.status(400).json({ error: 'Imagens de frente e verso são obrigatórias.' });
        }

        const frontImagePath = req.files.frontImage[0].path;
        const backImagePath = req.files.backImage[0].path;

        // Preprocessamento
        const processedFront = await preprocessImage(frontImagePath);
        const processedBack = await preprocessImage(backImagePath);

        // OCR nas imagens
        const [frontResult] = await client.textDetection(processedFront);
        const frontText = frontResult.textAnnotations?.[0]?.description || '';

        const [backResult] = await client.textDetection(processedBack);
        const backText = backResult.textAnnotations?.[0]?.description || '';

        // Remove os arquivos temporários
        await fs.unlink(frontImagePath);
        await fs.unlink(backImagePath);
        await fs.unlink(processedFront);
        await fs.unlink(processedBack);

        // Divide o texto em linhas
        const textLines = `${frontText}\n${backText}`.split('\n').map((line) => line.trim());

        // Extração de campos
        const name = getFieldNearLabel(textLines, 'nome');
        const cpf = textLines.find((line) => regexCpf.test(line))?.match(regexCpf)?.[1] || null;
        const cpfValid = cpf && cpfValidator.isValid(cpf) ? cpf : null;
        const birthDate = textLines.find((line) => regexDate.test(line))?.match(regexDate)?.[0] || null;
        const rg = textLines.find((line) => regexRg.test(line))?.match(regexRg)?.[0] || null;
        const parents = extractParents(textLines);
        const naturalidade = extractNaturalidade(textLines); // Captura apenas o valor da naturalidade

        res.json({
            message: 'Dados extraídos com sucesso',
            data: {
                name,
                cpf: cpfValid,
                birthDate,
                rg,
                parents,
                naturalidade,
            },
        });
    } catch (error) {
        console.error('Erro ao processar as imagens:', error.message);
        res.status(500).json({ error: 'Erro ao processar as imagens', details: error.message });
    }
};

export default analyzeImages;
