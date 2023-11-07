document.addEventListener('DOMContentLoaded', function () {
    proximaPaginaDados();
});

function atualizarVisibilidadeBotao(data) {
    const nextPageButton = document.getElementById('btnProximo');
    const priorPageButton = document.getElementById('btnAnterior');
    nextPageButton.disabled = (data.currentPage >= data.totalPages);
    priorPageButton.disabled = (data.currentPage <= 1);
}

function desabilitarBotao() {
    document.getElementById('btnProximo').style.display = 'none';
    document.getElementById('btnAnterior').style.display = 'none';
}

function adicionarDivsFiltros(respostas, limite = respostas.length) {
    const respFiltradas = document.querySelector('.respfiltradas');

    // Remover divs antigas
    const divsAntigas = document.querySelectorAll('.novaResposta');
    divsAntigas.forEach(div => div.remove());

    // Adicionar novas divs com os dados
    respostas.slice(0, limite).forEach(data => {
        const novaDiv = document.createElement('div');
        novaDiv.className = 'novaResposta';
        novaDiv.innerHTML = `
            <div class="containerTextos">
                <div class="nomeFiltro">Nome: ${data.Responsavel}</div>
                <div class="dataFiltro">Data: ${moment(moment(data.DataHora, 'DD/MM/YYYY HH:mm')).format('DD/MM/YYYY HH:mm')}</div>
                <div class="idFiltro">ID: ${data.id}</div>
            </div>
            <img class="coment" src="/Imagens/Comentario.png" alt="Comentar">
            <img class="deletar" onclick="excluir('${data._id}')" src="/Imagens/trash-2-512.png" alt="Deletar">
        `;

        respFiltradas.appendChild(novaDiv);
    });
}

function adicionarLinhasTabela(data) {
    const tabelasRespostas = document.querySelector('.respostasEnv');

    // Remover linhas antigas
    const linhasAntigas = document.querySelectorAll('.respostasEnv tr:not(:first-child)');
    linhasAntigas.forEach(linha => linha.remove());

    // Adicionar novas linhas com os dados
    data.forEach(item => {
        const novaLinha = document.createElement('tr');
        novaLinha.innerHTML = `
            <td class="respMongo">${item.id}</td>
            <td class="respMongo">${item.Responsavel}</td>
            <td class="respMongo">${item.CodigoReagente}</td>
            <td class="respMongo">${item.Reagente}</td>
            <td class="respMongo">${item.Quantidade + ' ' + item.Medida + ' ' + item.Outros}</td>
            <td class="respMongo">${item.Observacao}</td>
            <td class="respMongo">${moment(item.DataHora, 'DD/MM/YYYY HH:mm').format('DD/MM/YYYY HH:mm')}</td>
        `;

        tabelasRespostas.appendChild(novaLinha);
    });
}

document.getElementById('botaoFiltrar').addEventListener('click', function () {
    const tipoFiltro = document.getElementById('tipoFiltro').value;
    const valorPesquisa = document.getElementById('pesquisar').value;

    switch (tipoFiltro) {
        case 'ID':
            const ids = valorPesquisa.split('-');
            const id1 = ids[0];
            const id2 = ids[1] || id1;

            const urlId = `/buscarDadosId?id1=${id1}&id2=${id2}`;

            fetch(urlId)
                .then(response => response.json())
                .then(data => {
                    adicionarLinhasTabela(data);
                    adicionarDivsFiltros(data);
                    desabilitarBotao();
                })
                .catch(error => {
                    console.error('Erro ao buscar dados por ID: ', error);
                });
            break;

        case 'Nome':
            const nome = valorPesquisa;

            const urlNome = `/buscaNome?nome=${nome}`;

            fetch(urlNome)
                .then(response => response.json())
                .then(data => {
                    adicionarLinhasTabela(data);
                    adicionarDivsFiltros(data);
                })
                .catch(error => {
                    console.error('Erro ao buscar dados por nome: ', error);
                });
            break;

        case 'Code':
            const code = valorPesquisa;

            const urlCode = `/buscaCode?code=${code}`;

            fetch(urlCode)
                .then(response => response.json())
                .then(data => {
                   adicionarLinhasTabela(data);
                   adicionarDivsFiltros(data);
                })
                .catch(error => {
                    console.error('Erro ao buscar dados por código: ', error);
                });
            break;

        case 'Reagente':
            const reag = valorPesquisa;

            const urlReag = `/buscaReag?reag=${reag}`;

            fetch(urlReag)
                .then(response => response.json())
                .then(data => {
                    adicionarLinhasTabela(data);
                    adicionarDivsFiltros(data);
                })
                .catch(error => {
                    console.error('Erro ao buscar dados por Reagente : ', error);
                });
            break;

        case 'Data':
            const datas = valorPesquisa.split('-');
            const dataInicial = datas[0];
            const dataFinal = datas[1] || dataInicial;

            const urlDT = `/buscarDadosDT?dataInicial=${dataInicial}&dataFinal=${dataFinal}`;

            fetch(urlDT)
                .then(response => response.json())
                .then(data => {
                    adicionarLinhasTabela(data);
                    adicionarDivsFiltros(data);
                })
                .catch(error => {
                    console.error('Erro ao buscar dados por data: ', error);
                });
            break;

        default:
            console.error('Tipo de filtro não reconhecido');
    }
});

// Mudar o placeholder com base no tipo de filtro
document.getElementById('tipoFiltro').addEventListener('change', function(){
    const campo = document.getElementById('pesquisar');
    const tipoFiltro = document.getElementById('tipoFiltro').value;

    if (tipoFiltro === 'ID'){
        campo.placeholder = 'Digite o ID da resposta'
    } else if (tipoFiltro === 'Nome') {
        campo.placeholder = 'Digite o nome do Responsável'
    } else if (tipoFiltro === 'Code') {
        campo.placeholder = 'Digite o Código do Reagente'
    } else if (tipoFiltro === 'Reagente') {
        campo.placeholder = 'Digite o Reagente utilizado'
    } else if (tipoFiltro === 'Data' ) {
        campo.placeholder = 'Formato:(12/07/2023) Inicio - Fim'
    } else {
        console.error('Tipo de filtro não reconhecido');
        campo.placeholder = 'Verifique a opção escolhida!'
    }
});

// Remover Filtros
document.getElementById('removeFiltro').addEventListener('click', function(){
    const pesquisar = document.getElementById('pesquisar');
    pesquisar.value = '';
    pesquisar.focus();

    // Remova todas as linhas da tabela, exceto a primeira (cabeçalho)
    const linhas = document.querySelectorAll('.respostasEnv tr:not(:first-child)');
    linhas.forEach(linha => linha.remove());

    // Resetar a variável currentPage para 1
    currentPage = 1;

    // Faça uma nova solicitação ao servidor para obter os dados originais
    fetch('/ADM/data')
        .then(response => response.json())
        .then(data => {
            adicionarLinhasTabela(data.respostas);
            atualizarVisibilidadeBotao(data);
            adicionarDivsFiltros(data.respostas, 6);
            document.getElementById('btnAnterior').style.display = 'block';
            document.getElementById('btnProximo').style.display = 'block';
        })
        .catch(error => {
            console.error('Erro na requisição: ', error);
        });
});

var currentPage = 1;

function proximaPaginaDados() {
    const urlPag = `/ADM/data?page=${currentPage}`;

    fetch(urlPag)
        .then(response => response.json())
        .then(data => {
            adicionarLinhasTabela(data.respostas);
            atualizarVisibilidadeBotao(data);
        })
        .catch(error => {
            console.error('Erro ao ir para próxima página: ', error);
        });
}

document.getElementById('btnProximo').addEventListener('click', function(){
    currentPage ++;
    proximaPaginaDados();
});

document.getElementById('btnAnterior').addEventListener('click', function(){
    currentPage --;
    proximaPaginaDados();
});

async function excluir(id){
    const resposta = confirm('Tem certeza que quer deletar essa resposta?');

    if (resposta) {
        const respostaServidor = await fetch('/excluir', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
            },
            body: `id=${id}`,
        });

        const mensagem = await respostaServidor.text();
        alert(mensagem);

        location.reload();
    }
}