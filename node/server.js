// Bibliotecas Externas
require('dotenv').config({path: __dirname + '/variaveis.env'});
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const ejs = require('ejs');
const { google } = require('googleapis');

const app = express();
const port = 3000;

const key = require('../FormsPDI.json');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
database = client.db('forms');
collection = database.collection('Respostas');

const sheetClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth: sheetClient });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = 'Controle';

// Configurar o middleware para servir arquivos estáticos (CSS, JavaScript, imagens)
app.use('/PaginaPrincipal/Estilos', express.static(path.join(__dirname, '../PaginaPrincipal/Estilos')));
app.use('/PaginaPrincipal/Scripts', express.static(path.join(__dirname, '../PaginaPrincipal/Scripts')));
app.use('/Imagens', express.static(path.join(__dirname, '../Imagens')));
app.use('/PaginaADM/Estilos', express.static(path.join(__dirname, '../PaginaADM/Estilos')));
app.use('/PaginaADM/Scripts', express.static(path.join(__dirname, '../PaginaADM/Scripts')));

// Permite utilizar o "moment" em outros arquivod(EJS)
app.locals.moment = require('moment-timezone');

// Manipular arquivos JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Manipular EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../PaginaADM', 'Html'));

// Favicon
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../Imagens/Icone.ico'));
});  

// Pagina Inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../PaginaPrincipal/Html/MainPag.html'));
});

// Pagina de Envio
app.get('/Envio', (req, res) => {
  res.sendFile(path.join(__dirname, '../PaginaPrincipal/Html/EnvioPag.html'));
});

// Receber as informações
app.post('/salvar', async (req, res) => {
  try {
    // Definir o ID
    const maxIdDoc = await collection.findOne({}, { sort: { id: -1 } });
    const nextId = maxIdDoc ? maxIdDoc.id + 1 : 1;

    // Criar um novo documento para inserção
    const novaResposta = {
      id: nextId,
      Responsavel: req.body.nomeResponsavel,
      CodigoReagente: req.body.codigoReagente,
      Reagente: req.body.nomeReagente,
      Quantidade: req.body.quantidade,
      Medida: req.body.medida,
      Outros: req.body.outros,
      Observacao: req.body.observacao,
      DataHora: new Date()
    };

    // Inserir o documento no MongoDB
    await collection.insertOne(novaResposta);

    // Enviar para a planilha
    // await enviarParaGoogleSheets(novaResposta);

    // Enviar e-mail
    // enviarEmail(novaResposta);

    console.log('Dados salvos com sucesso no MongoDB');
    res.status(200).json({ success: true, redirectUrl: '/envio' });
  } catch (error) {
    console.error('Erro ao salvar os dados no MongoDB', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Login do email
// function enviarEmail(novaResposta) {
//   try{
//     if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//         console.error('Erro: As variáveis estão incorretas');
//         return;
//     }

//     const transporter = nodemailer.createTransport({
//         service: 'outlook',
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//         },
//     });

//     // Informações do Email
//     const emailHTML = `
//     <html>
//       <body>
//         <h1 style="color: #000; font-family: Arial;">Olá, uma nova resposta foi registrada!</h1>
//         <p style="color: black;"><b>ID:</b> ${novaResposta.id}</p>
//         <p style="color: black;"><b>Nome:</b> ${novaResposta.Responsavel}</p>
//         <p style="color: black;"><b>Código do reagente:</b> ${novaResposta.CodigoReagente}</p>
//         <p style="color: black;"><b>Reagente:</b> ${novaResposta.Reagente}</p>
//         <p style="color: black;"><b>Quantidade Utilizada:</b> ${novaResposta.Quantidade} - ${novaResposta.Medida} ${novaResposta.Outros}</p>
//         <p style="color: black;"><b>Observação:</b> ${novaResposta.Observacao}</p>
//         <p style="color: black;"><b>Data e Hora:</b> ${moment(novaResposta.DataHora).format('DD/MM/YYYY HH:mm')}</p>
//       </body>
//     </html>
//     `;

//     // Como o Email deve ser enviado
//     const mailOptions = {
//         from: 'Formulário PDI <' + process.env.EMAIL_USER + '>',
//         to: 'testeandoarthur@gmail.com',
//         subject: 'Novas respostas registradas no Formulário',
//         html: emailHTML,
//     };

//     transporter.sendMail(mailOptions, function (error, info) {
//         if (error) {
//             console.error('Erro ao enviar o email',error);
//         } else {
//             console.log('Email enviado com sucesso! ' + info.response);
//         }
//     });
//   } catch(error){
//     console.error('Erro geral ao enviar o email', error);
//   }
// }

async function enviarParaGoogleSheets(novaResposta) {
  try {
    const auth = sheetClient;

    // Verifica se há dados na planilha
    const sheetData = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME,
    });

    const values = [];

    // Se não houver dados, adiciona os títulos das colunas
    if (!sheetData.data.values) {
      values.push(['ID', 'Responsavel', 'CodigoReagente', 'Reagente', 'Quantidade', 'Observacao', 'DataHora']);
    }

    // Adiciona apenas dados que não estão na planilha
    novaResposta.DataHora = moment(novaResposta.dataHora).format('DD/MM/YYYY HH:mm');
    const dados = [
      novaResposta.id,
      novaResposta.Responsavel,
      novaResposta.CodigoReagente,
      novaResposta.Reagente,
      `${novaResposta.Quantidade} - ${novaResposta.Medida} ${novaResposta.Outros}`,
      novaResposta.Observacao,
      novaResposta.DataHora,
    ];

    const row = dados.map(item => item.toString());

    const exists = sheetData.data.values && sheetData.data.values.some(existingRow => isEqual(existingRow, row));

    if (!exists) {
      values.push(row);
    }

    // Adiciona os novos dados à planilha
    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME,
      valueInputOption: 'RAW',
      resource: { values },
    });

    console.log('Dados enviados para o Google Sheets com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar dados para o Google Sheets:', error);
  }
}

// Função para comparar arrays
function isEqual(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
}


// Enviar para a pagina de ADM
app.get('/ADM', async (req, res) => {
  try {

    // Buscar todas as respostas
    const respostas = await collection
      .find({})
      .sort({id: -1})
      .limit(14)
       .toArray();

    // Renderizar a página de respostas com os dados
    res.render('AdmMainPg', { respostas });
  } catch (error) {
    console.error('Erro ao ver os dados: ', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.get('/ADM/data', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const itensPerPage = 14;
    const skip = (page - 1) * itensPerPage;

    // Buscar as respostas com limite e paginação
    const respostas = await collection
      .find({})
      .sort({ id: -1 })
      .skip(skip)
      .limit(itensPerPage)
      .toArray();

    // Formatar a data no formato desejado
    const respostasFormatadas = respostas.map(item => ({
      ...item,
      DataHora: moment(item.DataHora).format('DD/MM/YYYY HH:mm')
    }));

    // Enviar os dados como JSON, incluindo informações de página
    res.json({
      respostas: respostasFormatadas,
      currentPage: page,
      totalPages: Math.ceil(await collection.countDocuments() / itensPerPage)
    });
  } catch (error) {
    console.error('Erro ao obter os dados: ', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Fazer a busca de dados por ID
app.get('/buscarDadosID', async (req, res) => {
  try{
    const { id1, id2 } = req.query;

    console.log('Recebendo requisição para /buscarDadosId: ', req.query);

    console.log('Id 1: ', id1);
    console.log('Id 2: ', id2);

    const result = await collection.find({
      id: {
        $gte: parseInt(id1),
        $lte: parseInt(id2),
      },
    }).toArray();

    const resultadosFormatados = result.map(item => {
      return {
        id: item.id,
        Responsavel: item.Responsavel,
        CodigoReagente: item.CodigoReagente,
        Reagente: item.Reagente,
        Quantidade: item.Quantidade,
        Medida: item.Medida,
        Outros: item.Outros,
        Observacao: item.Observacao,
        DataHora: moment(item.DataHora).format('DD/MM/YYYY HH:mm'),
      };
    });
    console.log('Resultados formatados: ', resultadosFormatados);
    res.json(resultadosFormatados);
  } catch (error) {
    console.error('Erro ao buscar os dados por Id: ', error);
    res.status(500).json({erorr: 'Erro interno no servidor'});
  }
});

// Fazer a busca de dados por data
app.get('/buscarDadosDT', async (req, res) => {
  try{
    const { dataInicial, dataFinal } = req.query;

    // Logs para informação
    console.log('Recebendo requisição para /buscarDadosDT: ', req.query);

    console.log('Data Inicial: ', dataInicial);
    console.log('Data Final: ', dataFinal);

    // Formatar as Datas para o formato "Date"
    const dataInicialDate = moment(dataInicial.trim(), 'DD/MM/YYYY', true).startOf('day').toDate();
    const dataFinalDate = moment(dataFinal.trim(), 'DD/MM/YYYY', true).endOf('day').toDate();

    // Fazer a busca entre as datas inseridas
    const result = await collection.find({
      DataHora: {
        $gte: dataInicialDate,
        $lte: dataFinalDate,
      },
    }).toArray();

    // Array de Objetos com os dados encontrados (formatados)
    const resultadosFormatados = result.map(item => {
      return {
        id: item.id,
        Responsavel: item.Responsavel,
        CodigoReagente: item.CodigoReagente,
        Reagente: item.Reagente,
        Quantidade: item.Quantidade,
        Medida: item.Medida,
        Outros: item.Outros,
        Observacao: item.Observacao,
        DataHora: moment(item.DataHora).format('DD/MM/YYYY HH:mm'),
      };
    });
    
    console.log('Resultados formatados: ', resultadosFormatados);
    res.json(resultadosFormatados);
  } catch (error) {
    console.error('Erro ao buscar os dados por data: ', error);
    res.status(500).json({error: 'Erro interno do servidor'});
  }
});

// Buscar por nome
app.get('/buscaNome', async (req, res) => {
  try {
    const { nome } = req.query;

    console.log('Recebendo requisição para /buscaNome: ', req.query);
    console.log('Nome: ', nome);

    const result = await collection.find({
      Responsavel: { $regex: new RegExp(`${nome}`, 'i') }
    }).toArray();    

    const resultadosFormatados = result.map(item => {
      return {
        id: item.id,
        Responsavel: item.Responsavel,
        CodigoReagente: item.CodigoReagente,
        Reagente: item.Reagente,
        Quantidade: item.Quantidade,
        Medida: item.Medida,
        Outros: item.Outros,
        Observacao: item.Observacao,
        DataHora: moment(item.DataHora).format('DD/MM/YYYY HH:mm'),
      };
    });

    console.log('Resultados formatados: ', resultadosFormatados);
    res.json(resultadosFormatados);
  } catch (error) {
    console.error('Erro ao buscar os dados por nome: ', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Busca por código
app.get('/buscaCode', async (req,res) => {
  try{
    const { code } = req.query;
    
    console.log('Recebendo requisição para /buscaCode: ', req.query);
    console.log('Código: ', code);

    const result = await collection.find({
      CodigoReagente: { $regex: new RegExp (`${code}`, 'i') }
    }).toArray();

    const resultadosFormatados = result.map(item => {
      return {
        id: item.id,
        Responsavel: item.Responsavel,
        CodigoReagente: item.CodigoReagente,
        Reagente: item.Reagente,
        Quantidade: item.Quantidade,
        Medida: item.Medida,
        Outros: item.Outros,
        Observacao: item.Observacao,
        DataHora: moment(item.DataHora).format('DD/MM/YYYY HH:mm'),
      };
    });

    console.log('Resultados formatados: ', resultadosFormatados)
    res.json(resultadosFormatados);
  } catch (error) {
    console.error('Erro ao buscar os dados pelo Código: ', error);
    res.status(500).json({ error: 'Erro interno do servidor'});
  }
});

//Busca por Reagente
app.get('/buscaReag', async (req, res) => {
  try{
    const { reag } = req.query;
    
    console.log('Recebendo requisição para /buscaReag');
    console.log('Reagente: ', reag);

    const result = await collection.find({
      Reagente: { $regex: new RegExp (`${reag}`, 'i') }
    }).toArray();

    const resultadosFormatados = result.map(item => {
      return {
        id: item.id,
        Responsavel: item.Responsavel,
        CodigoReagente: item.CodigoReagente,
        Reagente: item.Reagente,
        Quantidade: item.Quantidade,
        Medida: item.Medida,
        Outros: item.Outros,
        Observacao: item.Observacao,
        DataHora: moment(item.DataHora).format('DD/MM/YYYY HH:mm'),
      };
    });

    console.log('Resultados formatados: ', resultadosFormatados);
    res.json(resultadosFormatados);
  } catch (error) {
    console.error('Erro ao buscar por Reagente: ', error);
    res.status(500).json({error: 'Erro interno no servidor'});
  }
});

app.post('/excluir', async (req, res) => {
  const idExcluir = req.body.id;

  if (!idExcluir) {
    res.send('Id não encontrado');
    return;
  }

  try {
    const result = await collection.deleteOne({ _id: new ObjectId(idExcluir) });

    if (result.deletedCount === 1) {
      res.send('Documento excluído com sucesso');
    } else {
      res.send('Documento não encontrado');
    }
  } catch (error) {
    console.error('Erro ao excluir o documento: ', error);
    res.status(500).send('Erro interno no Servidor');
  }
});

//Ligar o servidor
app.listen(port, async () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});