const client = require('../config/googleConfig');
const fs = require('fs').promises;

// Regex para extração
const regexCpf = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/; // CPF
const regexDate = /\b\d{2}\/\d{2}\/\d{4}\b/; // Data de nascimento
const regexRg = /\b\d{2}\.\d{3}\.\d{3}-?\d?\b/; // RG
const regexParents = /(Filiação|Mãe|Pai):?\s*(.+)/i; // Filiação
const regexNaturalidade = /Naturalidade:?\s*(.+)/i; // Naturalidade

const analyzeImages = async (req, res) => {
    try {
        if (!req.files || !req.files.frontImage || !req.files.backImage) {
            return res.status(400).json({ error: 'Imagens de frente e verso são obrigatórias.' });
        }

        const frontImagePath = req.files.frontImage[0].path;
        const backImagePath = req.files.backImage[0].path;

        // Processa a imagem da frente
        const [frontResult] = await client.textDetection(frontImagePath);
        const frontText = frontResult.textAnnotations?.[0]?.description || '';

        // Processa a imagem do verso
        const [backResult] = await client.textDetection(backImagePath);
        const backText = backResult.textAnnotations?.[0]?.description || '';

        // Remove os arquivos temporários
        await fs.unlink(frontImagePath);
        await fs.unlink(backImagePath);

        // Combina os textos das duas imagens
        const combinedText = `${frontText}\n${backText}`;

        // Extração de dados
        const cpf = combinedText.match(regexCpf)?.[0] || null;
        const birthDate = combinedText.match(regexDate)?.[0] || null;
        const rg = combinedText.match(regexRg)?.[0] || null;
        const parents = combinedText.match(regexParents)?.[2] || null;
        const naturalidade = combinedText.match(regexNaturalidade)?.[1] || null;

        res.json({
            message: 'Dados extraídos com sucesso',
            data: {
                cpf,
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

module.exports = analyzeImages;
