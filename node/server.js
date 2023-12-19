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
const bcrypt = require('bcrypt');
const session = require('express-session')

const app = express();
const port = 3000;

const key = require('../FormsPDI.json');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
database = client.db('forms');
collection = database.collection('Respostas');
collectionReag = database.collection('Reagentes');

const sheetClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth: sheetClient });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = 'Controle';

const users = [
  {
    username: process.env.USERNAME,
    passwordHash: process.env.PASSWORD_HASH
  },
];

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

app.use(express.urlencoded({ extended: true }));
app.use(express.json())

// Configura o middleware do express-session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));

// Manipular EJS
app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname, '../PaginaADM', 'Html'),
  path.join(__dirname, '../PaginaPrincipal', 'Html'),
]);

// Favicon
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../Imagens/Icone.ico'));
});  

app.get('/', async (req, res) => {
  try {
    const reagente = await collectionReag.find({}).toArray();
    res.render('MainPag', { reagente });
  } catch(error) {
    console.error('Erro ao renderizar a página principal ', error);
    res.status(500).send('Erro interno no Servidor');
  }
});

// Pagina de Envio
app.get('/Envio', (req, res) => {
  res.sendFile(path.join(__dirname, '../PaginaPrincipal/Html/EnvioPag.html'));
});

// Pagina de login
app.get('/Login', (req, res) => {
  res.render('LoginPag', {error: null});
});

// Login para a pagina Adm
app.post('/Login', (req, res) => {
  const username = req.body.username.toUpperCase();
  const password = req.body.password;

  const envUsername = process.env.USERNAME_FORMS;
  const envPasswordHash = process.env.PASSWORD_HASH;

  if (username === envUsername && bcrypt.compareSync(password, envPasswordHash)) {
    req.session.user = username;
    res.redirect('/adm');
  } else {
    res.render('LoginPag', { error: 'Login ou senha incorretos! ' });
  }
});

// Receber as informações
app.post('/salvar', async (req, res) => {
  try {

    const opcoesValidas = (await collectionReag.find().toArray()).map(doc => `${doc.Codigo} - ${doc.Reagente}`.toLowerCase());
    const reagVal = req.body.valReag.toLowerCase().trim();
    
    if (!opcoesValidas.includes(reagVal)) {
      res.json({ success: false, error: 'Opção inválida selecionada' });
      return;
    }

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
    enviarParaGoogleSheets(novaResposta);

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
        <p style="color: black;"><b>Código do reagente:</b> ${novaResposta.CodigoReagente}</p>
        <p style="color: black;"><b>Reagente:</b> ${novaResposta.Reagente}</p>
        <p style="color: black;"><b>Quantidade Utilizada:</b> ${novaResposta.Quantidade} - ${novaResposta.Medida} ${novaResposta.Outros}</p>
        <p style="color: black;"><b>Observação:</b> ${novaResposta.Observacao}</p>
        <p style="color: black;"><b>Data e Hora:</b> ${moment(novaResposta.DataHora).format('DD/MM/YYYY HH:mm')}</p>
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

async function editarNoGoogleSheets(auth, existingRowIndex, row) {
  try {
    const sheetData = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME,
    });

    const originalDateTime = sheetData.data.values[existingRowIndex] 
      ? sheetData.data.values[existingRowIndex][6] // Assumindo que o horário está na 7ª coluna (índice 6)
      : '';

    row[6] = originalDateTime; // Substitui o horário atual pelo original

    // Atualiza a linha correspondente
    sheets.spreadsheets.values.update({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${existingRowIndex + 1}:G${existingRowIndex + 1}`,
      valueInputOption: 'RAW',
      resource: { values: [row] },
    });

    console.log('Dados editados no Google Sheets com sucesso!');
  } catch (error) {
    console.error('Erro ao editar dados no Google Sheets:', error);
  }
}

async function adicionarNoGoogleSheets(auth, row) {
  try {
    // Se os dados não existirem, adiciona a nova linha
    sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME,
      valueInputOption: 'RAW',
      resource: { values: [row] },
    });

    console.log('Dados adicionados ao Google Sheets com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar dados ao Google Sheets:', error);
  }
}

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

    // Adiciona os títulos das colunas se não houver dados na planilha
    if (!sheetData.data.values || sheetData.data.values.length === 0) {
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

    const existingRowIndex = sheetData.data.values
      ? sheetData.data.values.findIndex(existingRow => existingRow[0] === novaResposta.id.toString())
      : -1;

    if (existingRowIndex !== -1) {
      // Se os dados já existirem, atualiza a linha correspondente
      editarNoGoogleSheets(auth, existingRowIndex, row);
    } else {
      // Se os dados não existirem, adiciona a nova linha
      if (values.length > 0) {
        // Adiciona os títulos das colunas
        sheets.spreadsheets.values.append({
          auth,
          spreadsheetId: SPREADSHEET_ID,
          range: SHEET_NAME,
          valueInputOption: 'RAW',
          resource: { values },
        });
      }

      // Adiciona os dados
      await adicionarNoGoogleSheets(auth, row);
    }

  } catch (error) {
    console.error('Erro ao enviar dados para o Google Sheets:', error);
  }
}

// Função para Deletar dados da planilha
async function deletarDaGoogleSheets(idExcluir) {
  try {
    const auth = sheetClient;

    // Verifica se há dados na planilha
    const sheetData = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME,
    });

    const existingRowIndex = sheetData.data.values
      ? sheetData.data.values.findIndex(existingRow => existingRow[0] === idExcluir.toString())
      : -1;

    if (existingRowIndex !== -1) {
      // Remove apenas a linha correspondente
      sheetData.data.values.splice(existingRowIndex, 1);

      // Atualiza a planilha com os novos dados
      await sheets.spreadsheets.values.clear({
        auth,
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A${existingRowIndex + 1}:G${existingRowIndex + 1}`,
      });

      console.log(`Linha correspondente ao ID ${idExcluir} deletada com sucesso na planilha.`);
    } else {
      console.log(`ID ${idExcluir} não encontrado na planilha.`);
    }
  } catch (error) {
    console.error('Erro ao deletar dados na planilha:', error);
  }
}

// Salvar novo Reagente
app.post('/addReag', async function(req, res) {
  try {

    const codigoExistente = await collectionReag.findOne({ Codigo: req.body.code.toUpperCase() });

    if (codigoExistente) {
      throw new Error('Código já existe!');
    }

      const novoReag = {
          Codigo: req.body.code.toUpperCase(),
          Reagente: req.body.reagente.toUpperCase()
      };

      if (!novoReag.Codigo || !novoReag.Reagente) {
          throw new Error('Dados inválidos.');
      }

      await collectionReag.insertOne(novoReag);

      res.status(200).json({ success: true, message: 'Reagente inserido com sucesso' });
  } catch (error) {
      console.error('Erro ao salvar os dados', error);
      res.status(500).json({ success: false, error: error.message || 'Erro interno no servidor' });
    }
});

// Enviar para a pagina de ADM
app.get('/ADM', authenticate, async (req, res) => {
// app.get('/ADM', async (req, res) => {
  try {

    // Buscar todas as respostas
    const respostas = await collection
      .find({})
      .sort({id: -1})
      .limit(14)
      .toArray();


    const reagentes = await collectionReag.find({}).toArray()
    // Renderizar a página de respostas com os dados
    res.render('AdmMainPg', { respostas, reagentes });
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

    // Formatar as Datas para o formato "Date"
    const dataInicialDate = moment(dataInicial.trim(), ['DD/M/YYYY', 'D/M/YYYY', 'DD/MM/YYYY', 'D/MM/YYYY'], true).startOf('day').toDate();
    const dataFinalDate = moment(dataFinal.trim(), ['DD/M/YYYY', 'D/M/YYYY', 'DD/MM/YYYY', 'D/MM/YYYY'], true).endOf('day').toDate();

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

    res.json(resultadosFormatados);
  } catch (error) {
    console.error('Erro ao buscar por Reagente: ', error);
    res.status(500).json({error: 'Erro interno no servidor'});
  }
});

app.post('/atualizar', async (req, res) => {
  const idAtualizar = parseInt(req.body.id);

  if (!idAtualizar || isNaN(idAtualizar)) {
    res.status(400).send('ID inválido');
    return;
  }

  const campos = ['Responsavel', 'CodigoReagente', 'Reagente', 'Quantidade', 'Medida', 'Outros', 'Observacao'];
  const novosValores = {};

  for (const campo of campos) {
    if (req.body[campo] !== '') {
      novosValores[campo] = req.body[campo];
    } else {
      const documentoAtual = await collection.findOne({ id: idAtualizar });
      if (documentoAtual && documentoAtual[campo] !== undefined) {
        novosValores[campo] = documentoAtual[campo];
      } else {
        console.log(`Campo ${campo} não foi encontrado no documento atual no banco de dados`);
      }
    }
  }

  try {

    enviarParaGoogleSheets({
      id: idAtualizar,
      Responsavel: novosValores['Responsavel'],
      CodigoReagente: novosValores['CodigoReagente'],
      Reagente: novosValores['Reagente'],
      Quantidade: novosValores['Quantidade'],
      Medida: novosValores['Medida'],
      Outros: novosValores['Outros'],
      Observacao: novosValores['Observacao']
    });

    const result = await collection.updateOne(
      { id: idAtualizar },
      { $set: novosValores }
    );

    if (result.modifiedCount === 1) {
      res.send('Documento Atualizado com sucesso');
    } else {
      res.send('Documento não encontrado');
    }
  } catch (error) {
    console.error('Erro ao alterar o documento: ', error);
    res.status(500).send('Erro interno no Servidor');
  }
});

app.post('/editarReagente', async (req, res) => {
  const code = req.body.codeEdit;
  const newCode = req.body.code;
  const newReag = req.body.reag.toUpperCase();

  const codigoExistente = await collectionReag.findOne({ Codigo: req.body.code.toUpperCase() });

  try {
    if (codigoExistente) {
      throw new Error('Código já existente!');
    }

    if (!code) {
      throw new Error ('Por favor, insira um código válido!');
    }

    if(!newCode && !newReag) {
      throw new Error ('Por favor, insira os campos corretamente.');
    }

    const updateFields = {};

    if (newCode) {
      updateFields.Codigo = newCode;
    }

    if (newReag) {
      updateFields.Reagente = newReag;
    }

    const result = await collectionReag.updateOne(
      { Codigo: code },
      {
        $set: updateFields
      }
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ success: true, message: 'Reagente atualizado com sucesso' });
    } else {
      res.status(404).json({ success: false, message: 'Documento não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao editar Reagente ', error);
    res.status(500).json({ success: false, error: error.message || 'Erro interno no servidor' });
  }
});

app.post('/comentario', async (req, res) => {
  const idComentario = parseInt(req.body.id);

  if (!idComentario || isNaN(idComentario)) {
    res.status(400).send('Id inválido');
    return;
  }

  const Comentario = req.body.Comentario;
  
  if (Comentario === null || Comentario === undefined) {
    res.status(400).send('Comentário inválido');
    return;
  }

  try {
    const result = await collection.updateOne(
      { id: idComentario },
      {
        $addToSet: { Comentarios: Comentario }, // Adiciona apenas se não estiver presente
      },
      { upsert: true } // Cria o documento se não existir
    );

    if (result.upsertedCount === 1 || result.modifiedCount === 1) {
      res.send('Comentário adicionado com sucesso');
    } else {
      res.send('Documento não encontrado ou não modificado');
    }
  } catch (error) {
    console.error('Erro ao adicionar um comentário: ', error);
    res.status(500).send('Erro interno no servidor');
  }
});

app.get('/obterComentarios', async (req, res) => {
  const respostasId = req.query.id;

  try {

    const idNumerico = parseInt(respostasId, 10);

    if (isNaN(idNumerico)) {
      console.log('ID inválido');
      return res.status(400).json({ error: 'ID inválido' });
    }

    const resposta = await collection.findOne({ id: idNumerico });

    if (!resposta) {
      console.log('Resposta não encontrada');
      return res.status(404).json({ error: 'Resposta não encontrada' });
    }

    const comentarios = resposta.Comentarios || [];

    res.json(comentarios);
  } catch (error) {
    console.error('Erro ao obter comentários: ', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.post('/excluir', async (req, res) => {
  const idExcluir = parseInt(req.body.id);

  if (!idExcluir || isNaN(idExcluir)) {
    res.status(400).send('ID inválido');
    return;
  }

  try {

    deletarDaGoogleSheets(idExcluir);

    const result = await collection.deleteOne({ id: idExcluir });

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

app.post('/excluirComentario', async (req, res) => {
  const idExcluir = parseInt(req.body.id);
  const commentIndex = parseInt(req.body.commentDel) - 1;

  if (!idExcluir || isNaN(idExcluir) || isNaN(commentIndex)) {
    res.status(400).send('Id ou índice do comentário inválido');
    return;
  }

  try {
    await collection.updateOne({ id: idExcluir }, { $unset: { [`Comentarios.${commentIndex}`]: 1 } });

    await collection.updateOne({ id: idExcluir }, { $pull: { Comentarios: null } });

    const result = await collection.findOne({ id: idExcluir }, { id: 0, Comentarios: 1 });

    if (!result || !result.Comentarios) {
      res.status(404).send('Comentário não encontrado');
      return;
    }

    res.status(200).json(result.Comentarios);
  } catch (error) {
    console.error('Erro ao excluir o comentário: ', error);
    res.status(500).send('Erro interno no Servidor');
  }
});

app.post('/excluirReagente', async (req, res) => {
  const codeExcluir = req.body.codeExcluir;

  try {
    const regexPattern = new RegExp('^' + codeExcluir + '$', 'i');
    const result = await collectionReag.deleteOne({ Codigo: regexPattern });
    
    if (result.deletedCount === 1) {
      res.json({ success: true, message: 'Reagente excluído com sucesso' });
    } else {
      res.json({ success: false, message: 'Reagente não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao excluir Reagente ', error);
    res.status(500).json({ success: false, message: 'Erro interno no servidor' });
  }
});

function authenticate(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect('/Login');
  }
}

//Ligar o servidor
app.listen(port, async () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});