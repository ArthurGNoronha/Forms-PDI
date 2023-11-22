const bcrypt = require('bcrypt');
require('dotenv').config({path: __dirname + '/variaveis.env'});

const senha = process.env.SENHA;

if (!senha) {
  console.error('A variável de ambiente SENHA não está definida.');
  process.exit(1);
}

bcrypt.hash(senha, 10, (err, hash) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Novo hash:', hash);
  }
});