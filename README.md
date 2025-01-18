# Projeto de Análise de Documentos com Google Cloud Vision e S3

Este projeto utiliza a API do Google Cloud Vision para automatizar a análise de documentos de identidade, como RG e CNH. O processo inclui a extração de dados relevantes, como nome, data de nascimento e número do documento, e o upload das imagens para o Amazon S3 para armazenamento seguro.

## Funcionalidades

- **OCR com Google Cloud Vision**: Extrai texto de imagens de documentos utilizando a API do Google Cloud Vision.
- **Processamento de Documentos**: Analisa documentos de identidade (RG e CNH) para extrair informações chave.
- **Armazenamento em S3**: Faz upload das imagens dos documentos para um bucket do Amazon S3.
- *(Opcional)*: Integração com outros serviços, como bancos de dados ou APIs, para processamento adicional dos dados extraídos.

## Arquitetura

O projeto segue uma arquitetura simples:

1. **Entrada**: As imagens dos documentos são fornecidas como entrada.
2. **Processamento**: A API do Google Cloud Vision é utilizada para realizar o OCR e extrair o texto das imagens.
3. **Extração de Dados**: Os dados relevantes são extraídos do texto com base em regras específicas para cada tipo de documento.
4. **Armazenamento**: As imagens dos documentos são armazenadas em um bucket do Amazon S3.
5. *(Opcional)*: Os dados extraídos podem ser processados por outros serviços ou APIs.

## Como Usar

### 1. Configurar o Ambiente

1. **Google Cloud Platform**:
   - Criar uma conta no [Google Cloud Platform](https://cloud.google.com/).
   - Ativar a API do Cloud Vision.
   - Configurar as credenciais de autenticação.

2. **Amazon Web Services (AWS)**:
   - Criar uma conta no [Amazon Web Services](https://aws.amazon.com/).
   - Configurar um bucket do S3 para armazenamento.
   - Gerar uma chave de acesso para integração com o S3.

3. **Instalar as Dependências**:
   - Certifique-se de ter o Node.js instalado.
   - Instale as bibliotecas necessárias executando o comando:
     ```bash
     npm install
     ```

### 2. Executar o Projeto

1. Forneça as imagens dos documentos como entrada.
2. Execute o projeto para processar as imagens, extrair os dados e fazer o upload para o S3.

### Comandos Úteis

- **Iniciar o projeto**:
  ```bash
  node index.js
  ```

- **Testar com imagens de exemplo**:
  ```bash
  node test.js
  ```

## Contribuição

Contribuições são bem-vindas! Siga os passos abaixo para contribuir:

1. Faça um fork do repositório.
2. Crie uma branch com sua feature: `git checkout -b minha-feature`.
3. Faça commit das suas alterações: `git commit -m 'Minha nova feature'`.
4. Envie para o repositório remoto: `git push origin minha-feature`.
5. Abra um pull request.



**Nota**: Certifique-se de armazenar as credenciais e chaves de acesso de forma segura e nunca incluí-las diretamente no código-fonte.
