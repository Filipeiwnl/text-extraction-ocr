require('dotenv').config();
const express = require('express');
const imageRoutes = require('./src/routes/imageRoutes');

const app = express();
const PORT = process.env.PORT || 3000; // Valor padrão

app.use(express.json());
app.use('/api/images', imageRoutes);

app.get('/', (req, res) => {
    res.send('Servidor rodando com sucesso!');
});

// Rota de monitoramento de saúde
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
