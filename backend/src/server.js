import app from "./app.js"
const error = (err) => {
    console.error(`Erro ao iniciar o servidor: ${err}`);
    throw err;
};

app.listen(process.env.port || 3000, () => {
    console.log(`Servidor rodando em http://localhost:${process.env.port || 3000}`);
});
app.on('error', error);