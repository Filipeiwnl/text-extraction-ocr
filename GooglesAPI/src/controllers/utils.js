const getFieldValueAfterLabel = (textLines, label, offset = 1) => {
    const index = textLines.findIndex((line) => line.toLowerCase().includes(label.toLowerCase()));
    return index !== -1 && index + offset < textLines.length
        ? textLines[index + offset].trim()
        : null;
};

// Função para extrair filiação
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

const extractNaturalidade = (textLines) => {
    // Lista de estados brasileiros válidos
    const validStates = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

    // Regex para identificar padrões de cidade/estado
    const cityStateRegex = /\b([a-záéíóúãõç\s]+)\/([a-z]{2})\b/i;

    // Itera sobre as linhas para encontrar o padrão correto
    for (let i = 0; i < textLines.length; i++) {
        const line = textLines[i];

        // ve se a linha tem um padrão de cidade/estado
        const match = line.match(cityStateRegex);
        if (match) {
            const city = match[1].trim(); // Extrai a cidade
            const state = match[2].toUpperCase(); // Extrai o estado

            // Verifica se o estado é válido
            if (validStates.includes(state)) {
                return `${city}/${state}`; // Retorna a naturalidade no formato Cidade/Estado
            }
        }
    }

    //retorna null se nada for encontrado
    return null;
};

export { getFieldValueAfterLabel, extractParents, extractNaturalidade }