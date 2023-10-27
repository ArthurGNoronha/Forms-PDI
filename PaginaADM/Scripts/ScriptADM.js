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
                    const tabelasRespostas = document.querySelector('.respostasEnv');

                    // Remover todas as linhas, exceto o cabeçalho
                    const linhasAntigas = document.querySelectorAll('.respostasEnv tr:not(:first-child)');
                    linhasAntigas.forEach(linha => linha.remove());

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
                    })
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
                    console.log('Resultados do filtro do Nome: ', data);
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
                    console.log('Resultados do filtro por código: ', data);
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
                    console.log('Resultados do filtro por Reagente ', data);
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
                    console.log('Resultados do filtro por data: ', data);
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

    if(tipoFiltro === 'ID'){
        campo.placeholder = 'Digite o ID da resposta'
    } else if (tipoFiltro === 'Nome') {
        campo.placeholder = 'Digite o nome do Responsável'
    } else if (tipoFiltro === 'Code') {
        campo.placeholder = 'Digite o Código do Reagente'
    } else if (tipoFiltro === 'Reagente') {
        campo.placeholder = 'Digite o Reagente utilizado'
    } else if (tipoFiltro === 'Data' ) {
        campo.placeholder = 'Formato: Inicio - Fim(12/07/2023)'
    } else {
        console.error('Tipo de filtro não reconhecido');
        campo.placeholder = 'Verifique a opção escolhida!'
    }
});