const multer = require('multer');
const path = require('path');

// Configurações gerais
const UPLOADS_DIR = path.resolve('uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const ALLOWED_TYPES = /jpeg|jpg|png|gif/;

// Configuração de armazenamento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// Filtro de arquivo
const fileFilter = (req, file, cb) => {
    const mimeType = ALLOWED_TYPES.test(file.mimetype);
    const extName = ALLOWED_TYPES.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extName) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens (JPEG, JPG, PNG, GIF) são permitidas.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
}).fields([
    { name: 'frontImage', maxCount: 1 }, // Frente
    { name: 'backImage', maxCount: 1 }, // Verso
]);

module.exports = upload;
