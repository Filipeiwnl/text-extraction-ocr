import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import imageRoutes from './src/routes/imageRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Cria a pasta de uploads se não existir
const UPLOADS_DIR = path.resolve('uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

app.use(express.json());
app.use('/api/images', imageRoutes);

app.get('/', (req, res) => {
    res.send('Servidor rodando! Envie imagens na rota /api/images/analyze');
});

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
