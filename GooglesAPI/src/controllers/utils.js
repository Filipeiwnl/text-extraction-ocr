const CPF_REGEX = /(?:CPF|C\.?P\.?F\.?):?\s*(\d{3}\.\d{3}\.\d{3}-\d{2})/i;
const DATE_REGEX = /\b\d{2}\/\d{2}\/\d{4}\b/;

// Função para buscar valores próximos de um rótulo
const getFieldValueAfterLabel = (textLines, label, offset = 1) => {
    const index = textLines.findIndex((line) => line.toLowerCase().includes(label.toLowerCase()));
    return index !== -1 && index + offset < textLines.length
        ? textLines[index + offset].trim()
        : null;
};

// Função para extrair filiação (específica para RGs)
const extractParents = (textLines) => {
    const parentsIndex = textLines.findIndex((line) =>
        line.toLowerCase().includes('filiação')
    );
    if (parentsIndex !== -1) {
        // Para lidar com casos onde "filiação" é seguido por uma ou mais linhas
        const parentLines = textLines.slice(parentsIndex + 1, parentsIndex + 3);
        return parentLines.join(' ').trim();
    }
    return null;
};

// Função para extrair naturalidade (específica para RGs)
const extractNaturalidade = (textLines) => {
    const validStates = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
    const cityStateRegex = /\b([a-záéíóúãõç\s]+)\/([a-z]{2})\b/i;

    for (let i = 0; i < textLines.length; i++) {
        const line = textLines[i];
        const match = line.match(cityStateRegex);
        if (match) {
            const city = match[1].trim();
            const state = match[2].toUpperCase();
            if (validStates.includes(state)) {
                return `${city}/${state}`;
            }
        }
    }

    return null;
};

// Ajustes para lidar com o formato de saída do Document AI
const parseDocumentText = (document) => {
    if (!document || !document.text) {
        throw new Error('Documento inválido ou sem texto extraído.');
    }

    // Divide o texto em linhas e remove linhas vazias
    const textLines = document.text.split('\n').map((line) => line.trim());
    return textLines.filter((line) => line.length > 0);
};

// Função principal para processar texto extraído
const processDocumentData = (document) => {
    const textLines = parseDocumentText(document);

    // Extração dos campos específicos
    const cpf = textLines.find((line) => CPF_REGEX.test(line))?.match(CPF_REGEX)?.[1] || null;
    const birthDate = textLines.find((line) => DATE_REGEX.test(line))?.match(DATE_REGEX)?.[0] || null;
    const naturalidade = extractNaturalidade(textLines);
    const parents = extractParents(textLines);

    return { cpf, birthDate, naturalidade, parents };
};

// Exporta as funções
export {
    getFieldValueAfterLabel,
    extractParents,
    extractNaturalidade,
    parseDocumentText,
    processDocumentData,
};
