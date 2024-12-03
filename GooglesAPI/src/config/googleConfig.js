import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do cliente Document AI
const client = new DocumentProcessorServiceClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Caminho para o arquivo de credenciais JSON
});

export default client;
