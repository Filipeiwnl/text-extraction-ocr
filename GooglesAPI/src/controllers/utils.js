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

// Exporta as funções
export {
    getFieldValueAfterLabel,
    extractParents,
    extractNaturalidade,
    
};
