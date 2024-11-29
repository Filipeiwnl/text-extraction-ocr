const extractNameFromCnh = (textLines) => {
    return getFieldValueAfterLabel(textLines, 'nome');
};

// Função para extrair o CPF da CNH
const extractCpfFromCnh = (textLines) => {
    const cpfLine = textLines.find((line) => CPF_REGEX.test(line));
    return cpfLine ? cpfLine.match(CPF_REGEX)[1].replace(/\s/g, '') : null; // Remove espaços
};

// Função para extrair o número da CNH
const extractCnhNumber = (textLines) => {
    const rawNumber = getFieldValueAfterLabel(textLines, 'n° registro') || getFieldValueAfterLabel(textLines, 'n registro');
    return rawNumber ? rawNumber.replace(/\D/g, '') : null; // Remove caracteres não numéricos
};


// Função para extrair a validade da CNH
const extractValidity = (textLines) => {
    return getFieldValueAfterLabel(textLines, 'validade');
};

const extractCpfAndBirthDateFromCnh = (textLines) => {
    const combinedLine = textLines.find((line) =>
        line.match(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b.*\b\d{2}\/\d{2}\/\d{4}\b/)
    );

    if (combinedLine) {
        const cpfMatch = combinedLine.match(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/); // Captura CPF
        const dateMatch = combinedLine.match(/\b\d{2}\/\d{2}\/\d{4}\b/); // Captura Data de Nascimento

        return {
            cpf: cpfMatch ? cpfMatch[0] : null,
            birthDate: dateMatch ? dateMatch[0] : null,
        };
    }

    return { cpf: null, birthDate: null };
};



// Função para extrair filiação da CNH
const extractParentsFromCnh = (textLines) => {
    const parentsIndex = textLines.findIndex((line) =>
        line.toLowerCase().includes('filiação')
    );

    if (parentsIndex !== -1) {
        const parentLines = textLines.slice(parentsIndex + 1, parentsIndex + 3); // Captura as duas linhas seguintes
        return parentLines.join(' ').trim(); // Junta os nomes em uma única string
    }

    return null;
};


// Função para extrair a data da 1ª habilitação
const extractFirstLicenseDate = (textLines) => {
    return getFieldValueAfterLabel(textLines, '1ª habilitação');
};

export {
    extractNameFromCnh,
    extractCpfFromCnh,
    extractCnhNumber,
    extractValidity,
    extractCpfAndBirthDateFromCnh,
    extractParentsFromCnh,
    extractFirstLicenseDate,
};