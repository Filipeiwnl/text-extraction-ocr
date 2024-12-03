import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import imageRoutes from './src/routes/imageRoutes.js';
import s3Routes from './src/routes/s3Routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Função para configurar diretórios necessários
const initializeDirectories = () => {
    const UPLOADS_DIR = path.resolve('uploads');
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR);
        console.log(`Diretório '${UPLOADS_DIR}' criado com sucesso.`);
    }
};

// Inicializa os diretórios
initializeDirectories();

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' })); // Ajustado para aceitar payloads grandes
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/images', imageRoutes);
app.use('/s3', s3Routes);

// Rota inicial
app.get('/', (req, res) => {
    res.send('Servidor rodando! Envie imagens na rota /api/images/analyze');
});

// Middleware para erros globais
app.use((err, req, res, next) => {
    console.error('Erro capturado:', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Erro interno do servidor',
    });
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

export default app; // Permite reuso em testes
