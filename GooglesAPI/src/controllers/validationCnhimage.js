import {extractNameFromCnh,  extractCnhNumber,  extractValidity, extractCpfAndBirthDateFromCnh, extractParentsFromCnh, extractFirstLicenseDate} from './utilsCnh.js';


const analyzeImagesCnh = async (req, res) => {
    try {
        if (!req.files?.frontImage) {
            return res.status(400).json({ error: 'A imagem da CNH é obrigatória.' });
        }

        const frontImagePath = req.files.frontImage[0].path;

        // Pré-processamento da imagem
        const processedFront = await preprocessRgImage(frontImagePath);

        // OCR na imagem
        const [frontResult] = await client.textDetection(processedFront);
        const frontText = frontResult.textAnnotations?.[0]?.description || '';
        console.log('Texto OCR CNH:', frontText);

        // Divide o texto em linhas
        const textLines = frontText.split('\n').map((line) => line.trim());

        // Extração de campos da CNH
        const name = extractNameFromCnh(textLines);
        const { cpf, birthDate } = extractCpfAndBirthDateFromCnh(textLines);
        const cnhNumber = extractCnhNumber(textLines);
        const validity = extractValidity(textLines);
        const parents = extractParentsFromCnh(textLines);
        const firstLicenseDate = extractFirstLicenseDate(textLines);

        res.json({
            message: 'Dados extraídos com sucesso',
            data: {
                name,
                cpf,
                birthDate,
                parents,
                cnhNumber,
                validity,
                firstLicenseDate,
            },
        });
    } catch (error) {
        console.error('Erro ao processar a imagem da CNH:', error.message, error.stack);
        res.status(500).json({ error: 'Erro ao processar a imagem da CNH', details: error.message });
    }
};


export default analyzeImagesCnh;