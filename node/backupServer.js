// Bibliotecas Externas
require('dotenv').config({path: __dirname + '/variaveis.env'});
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Configurar o middleware para servir arquivos estáticos (CSS, JavaScript, imagens)
app.use('/PaginaPrincipal/Estilos', express.static(path.join(__dirname, '../PaginaPrincipal/Estilos')));
app.use('/PaginaPrincipal/Scripts', express.static(path.join(__dirname, '../PaginaPrincipal/Scripts')));
app.use('/PaginaPrincipal/Imagens', express.static(path.join(__dirname, '../PaginaPrincipal/Imagens')));

// Manipular arquivos JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Favicon
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../PaginaPrincipal/Imagens/Icone.ico'));
});  

// Pagina Inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../PaginaPrincipal/Html/MainPag.html'));
});

// Pagina de Envio
app.get('/EnvioPag.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../PaginaPrincipal/Html/EnvioPag.html'));
});

// Receber as informações
app.post('/salvar', async (req, res) => {

  try {
    // Conectar ao banco de dados
    await client.connect();
    
    // Selecionar o banco de dados e a coleção
    const database = client.db('forms');
    const collection = database.collection('Respostas');

    // Definir o ID
    const maxIdDoc = await collection.findOne({}, {sort: {id: -1}});

    const nextId = maxIdDoc ? maxIdDoc.id + 1 : 1;
    
    // Criar um novo documento para inserção
    const novaResposta = {
      id: nextId,
      Responsavel: req.body.nomeResponsavel,
      codigoReagente: req.body.codigoReagente,
      Reagente: req.body.nomeReagente,
      quantidade: req.body.quantidade,
      medida: req.body.medida,
      outros: req.body.outros,
      observacao: req.body.observacao,
      dataHora: moment().tz('America/Sao_Paulo').format('DD-MM-YYYY HH:mm'),
    };

    // Inserir o documento no MongoDB
    await collection.insertOne(novaResposta);

    // Enviar e-mail
    enviarEmail(novaResposta);

    console.log('Dados salvos com sucesso no MongoDB');
    res.redirect('/EnvioPag.html');
  } catch (error) {
    console.error('Erro ao salvar os dados no MongoDB', error);
    res.status(500).send('Erro interno do servidor');
  } finally {
    // Fechar a conexão com o MongoDB
    await client.close();
  }
});

// Login do email
function enviarEmail(novaResposta) {
  try{
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Erro: As variáveis estão incorretas');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Informações do Email
    const emailHTML = `
    <html>
      <body>
        <h1 style="color: #000; font-family: Arial;">Olá, uma nova resposta foi registrada!</h1>
        <p style="color: black;"><b>ID:</b> ${novaResposta.id}</p>
        <p style="color: black;"><b>Nome:</b> ${novaResposta.Responsavel}</p>
        <p style="color: black;"><b>Código do reagente:</b> ${novaResposta.codigoReagente}</p>
        <p style="color: black;"><b>Reagente:</b> ${novaResposta.Reagente}</p>
        <p style="color: black;"><b>Quantidade Utilizada:</b> ${novaResposta.quantidade} - ${novaResposta.medida} ${novaResposta.outros}</p>
        <p style="color: black;"><b>Observação:</b> ${novaResposta.observacao}</p>
        <p style="color: black;"><b>Data e Hora:</b> ${novaResposta.dataHora}</p>
      </body>
    </html>
    `;

    // Como o Email deve ser enviado
    const mailOptions = {
        from: 'Formulário PDI <' + process.env.EMAIL_USER + '>',
        to: 'testeandoarthur@gmail.com',
        subject: 'Novas respostas registradas no Formulário',
        html: emailHTML,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error('Erro ao enviar o email',error);
        } else {
            console.log('Email enviado com sucesso! ' + info.response);
        }
    });
  } catch(error){
    console.error('Erro geral ao enviar o email', error);
  }
}

//Ligar o servidor
app.listen(port, async () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});