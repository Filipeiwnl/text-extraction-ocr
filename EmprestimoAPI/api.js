import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Configuração de Credenciais
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const AUTH_URL = process.env.AUTH_SERVER; 
const PERSON_URL = process.env.PERSON_SERVER; 

let accessToken = null; 
let tokenExpiry = null; 

const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`)
console.log(authString.toString("base64"))
app.post("/auth", async (req, res) => {
  try {
    const response = await axios.post(
      AUTH_URL,
      "grant_type=client_credentials",
      {
        headers: {
          //åAuthorization: `Basic ${authString}`,
          //åß"Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000;

    res.status(200).json({
      message: "Token gerado com sucesso!",
      access_token: accessToken,
    });
  } catch (error) {
    console.error("Erro ao autenticar:", error.response?.data || error.message);
    res.status(500).json({
      message: "Erro ao autenticar.",
      error: error.response?.data || error.message,
    });
  }
});

// Middleware para verificar validade do token
const ensureValidToken = async (req, res, next) => {
  if (!accessToken || Date.now() >= tokenExpiry) {
    return res.status(401).json({ message: "Token expirado ou não autenticado. Faça a autenticação novamente." });
  }
  next();
};

// Rota para criar uma pessoa
app.post("/create-person", ensureValidToken, async (req, res) => {
  try {
    const options = {
      method: "POST",
      url: PERSON_URL,
      headers: {
        accept: "*/*",
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      data: req.body, // Dados enviados diretamente no Postman
    };

    // Fazer a requisição para criar a pessoa
    const response = await axios.request(options);
    res.status(200).json({
      message: "Pessoa criada com sucesso!",
      data: response.data,
    });
  } catch (error) {
    console.error("Erro ao criar pessoa:", error.response?.data || error.message);
    res.status(500).json({
      message: "Erro ao criar pessoa.",
      error: error.response?.data || error.message,
    });
  }
});

// Inicializar o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
