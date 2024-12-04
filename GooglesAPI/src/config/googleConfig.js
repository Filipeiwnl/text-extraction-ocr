//import { v1 } from '@google-cloud/documentai';
import {DocumentProcessorServiceClient} from '@google-cloud/documentai'
import dotenv from 'dotenv';

dotenv.config();

const teste = process.env.GOOGLE_APPLICATION_CREDENTIALS
// Configuração do cliente Document AI
const client = new DocumentProcessorServiceClient({

    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

//console.log(client.getProcessorVersion())  

export default client;
