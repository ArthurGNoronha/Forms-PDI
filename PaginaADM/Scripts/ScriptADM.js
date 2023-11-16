document.addEventListener('DOMContentLoaded', function () {
    proximaPaginaDados();
});

// Desabilitar os botões quando a página chega no Fim/Inicio
function atualizarVisibilidadeBotao(data) {
    const nextPageButton = document.getElementById('btnProximo');
    const priorPageButton = document.getElementById('btnAnterior');
    nextPageButton.disabled = (data.currentPage >= data.totalPages);
    priorPageButton.disabled = (data.currentPage <= 1);
}

// Função para esconder os botões quando o Filtro é ativado
function desabilitarBotao() {
    document.getElementById('btnProximo').style.display = 'none';
    document.getElementById('btnAnterior').style.display = 'none';
}

// Função para exibir os dados na tela e os botões de exclusão ou modificação
function adicionarDivsFiltros(respostas, limite = respostas.length) {
    const respFiltradas = document.querySelector('.respfiltradas');

    // Remover divs antigas
    const divsAntigas = document.querySelectorAll('.novaResposta');
    divsAntigas.forEach(div => div.remove());

    // Adicionar novas divs com os dados
    respostas.slice(0, limite).forEach(data => {
        const novaDiv = document.createElement('div');
        novaDiv.className = 'novaResposta';

        const dataFormatada = moment(data.DataHora, ['DD/MM/YYYY HH:mm', 'YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DD HH:mm:ss'], true);

        const nomeFiltro = `Nome: ${data.Responsavel}`;
        const dataFiltro = dataFormatada.isValid() ? `Data: ${dataFormatada.format('DD/MM/YYYY HH:mm')}` : 'Data inválida';

        novaDiv.innerHTML = `
            <div class="containerTextos">
                <div class="nomeFiltro">${nomeFiltro}</div>
                <div class="dataFiltro">${dataFiltro}</div>
                <div class="idFiltro">ID: ${data.id}</div>
            </div>
            <img class="editar" 
            data-id=${data.id}"
            src="/Imagens/edit.png" alt="Editar">
            <img class="deletar"
                data-id="${data.id}"
                data-Responsavel="${data.Responsavel}"
                data-DataHora="${data.DataHora}"
                src="/Imagens/trash-2-512.png" alt="Deletar">
        `;

        respFiltradas.appendChild(novaDiv);
    });
}

// Função para exibir os dados na tela
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

// Filtrar dados com base na opção selecionada
document.getElementById('botaoFiltrar').addEventListener('click', function () {
    const tipoFiltro = document.getElementById('tipoFiltro').value;
    const valorPesquisa = document.getElementById('pesquisar').value;

    switch (tipoFiltro) {
        case 'ID':
            const ids = valorPesquisa.split('-');
            let id1 = ids[0];
            let id2 = ids[1] || id1;

            if (!id1) {
                id1 = '1';
                id2 = '99999999';
            }

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
                    desabilitarBotao();
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
                   desabilitarBotao();
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
                    desabilitarBotao();
                })
                .catch(error => {
                    console.error('Erro ao buscar dados por Reagente : ', error);
                });
            break;

        case 'Data':
            const datas = valorPesquisa.split('-');
            let dataInicial = datas[0];
            let dataFinal = datas[1] || dataInicial;

            if (!dataInicial) {
                dataInicial = '01/01/1970';
                dataFinal = '01/01/3000';
              }

            const urlDT = `/buscarDadosDT?dataInicial=${dataInicial}&dataFinal=${dataFinal}`;

            fetch(urlDT)
                .then(response => response.json())
                .then(data => {
                    adicionarLinhasTabela(data);
                    adicionarDivsFiltros(data);
                    desabilitarBotao();
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

    // Remover todas as linhas da tabela, exceto a primeira (cabeçalho)
    const linhas = document.querySelectorAll('.respostasEnv tr:not(:first-child)');
    linhas.forEach(linha => linha.remove());

    currentPage = 1;

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

// Alterar Página de dados

var currentPage = 1;

// Função para Avançar ou retroceder as páginas
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

// Avançar uma página
document.getElementById('btnProximo').addEventListener('click', function(){
    currentPage ++;
    proximaPaginaDados();
});

// Voltar uma página
document.getElementById('btnAnterior').addEventListener('click', function(){
    currentPage --;
    proximaPaginaDados();
});

// Deletar Dados

// Obtem os botões
const overlay = document.getElementById('overlay');
const confirmar = document.getElementById('confirmar');
const btnConfirmar = document.getElementById('sim');
const btnCancelar = document.getElementById('nao');

// Variaveis locais para o Id, Responsável e Data atual
let currentId;
let currentResponsavel;
let currentDate;

// Função para receber quais os dados da resposta que o usuário selecionou
function processarEvento(event){
    currentId = event.target.dataset.id;
    currentResponsavel = event.target.dataset.responsavel;

    const dataBruta = moment(event.target.dataset.datahora, 'DD/MM/YYYY HH:mm').toDate();

    const formatosDeData = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };

    let dataFormatada;
    try {
        dataFormatada = dataBruta.toLocaleString('pt-BR', formatosDeData);
    } catch (error) {
        console.error('Erro ao formatar a data:', dataBruta, error);
        dataFormatada = 'Data inválida';
    }

    currentDate = dataFormatada;

    overlay.style.display = 'block'
}

// Exibe na tela quais dados estão sendo Alterados/Deletados
document.querySelector('.respfiltradas').addEventListener('click', (event) => {
    if (event.target.classList.contains('deletar')) {

        processarEvento(event);
        
        const confirmacao = `Deseja mesmo excluir essa resposta?\n ID: ${currentId}\n Responsavel: ${currentResponsavel}\n Data: ${currentDate}`;
        document.getElementById('confirmacao').innerText = confirmacao;
        
        confirmar.style.display = 'block';
    }

    else if (event.target.classList.contains('editar')) {

        processarEvento(event);

        const texto = `Você está editando a resposta com o ID: ${currentId} do Responsável: ${currentResponsavel}`;
        document.getElementById('respAtual').innerText = texto;
        
        divEdit.style.display = 'block';
    }
});

// Cancelar a exclusão
btnCancelar.addEventListener('click', () => {
    overlay.style.display = 'none';
    confirmar.style.display = 'none';
})

// Confirmar a exclusão
btnConfirmar.addEventListener('click', excluirResposta);

// Função para Excluir as Respostas
function excluirResposta() {
    overlay.style.display = 'none';
    confirmar.style.display = 'none';

    // Envia o ID para o servidor
    const params = new URLSearchParams();
    params.append('id', currentId);

    // Faz o requerimento para a exclusão
    fetch('/excluir', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    })
    .then(response => response.text())
    .then(mensagem => {
        alert(mensagem);
        location.reload();
    })
    .catch(error => {
        console.error('Erro ao excluir resposta:', error);
        alert('Erro ao excluir resposta. Por favor, tente novamente.');
    });
}

// Atualizar Respostas

// Pegar os botões
const divEdit = document.getElementById('divEdit');
const confirmarEdit = document.getElementById('simEdit');
const cancelarEdit = document.getElementById('naoEdit');

// Cancelar
cancelarEdit.addEventListener('click', () => {
    overlay.style.display = 'none';
    divEdit.style.display = 'none';
});

// Confirmar
confirmarEdit.addEventListener('click', () => {
    alterarDados(currentId);
});

// Função para alterar os dados
async function alterarDados(currentId) {
    // Verifica se o Id é válido
    if (isNaN(currentId)) {
        console.error('ID não é um número válido:', currentId);
        return;
    }

    // Recebe os dados atualizados
    const responsavel = document.getElementById('Responsavel').value.trim();
    const code = document.getElementById('Codigo').value.trim();
    const reag = document.getElementById('Reagente').value.trim();
    const qtd = document.getElementById('Quantidade').value.trim();
    const medida = document.getElementById('Medida').value.trim();
    const outros = document.getElementById('Outros').value.trim();
    const observacao = document.getElementById('Observacao').value.trim();

    // Separa os dados com os nomes corretos do BD
    const requestBody = new URLSearchParams();
    requestBody.append('id', currentId);
    requestBody.append('Responsavel', responsavel);
    requestBody.append('CodigoReagente', code);
    requestBody.append('Reagente', reag);
    requestBody.append('Quantidade', qtd);
    requestBody.append('Medida', medida);
    requestBody.append('Outros', outros);
    requestBody.append('Observacao', observacao);

    // Envia os dados para o servidor
    try {
        const response = await fetch('/atualizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: requestBody,
        });

        const result = await response.text();
        alert(result);

        document.getElementById('Responsavel').value = '';
        document.getElementById('Codigo').value = '';
        document.getElementById('Reagente').value = '';
        document.getElementById('Quantidade').value = '';
        document.getElementById('Medida').value = '';
        document.getElementById('Outros').value = '';
        document.getElementById('Observacao').value = '';
        location.reload();
    } catch (error) {
        console.error('Erro ao fazer a requisição: ', error);
    }
}