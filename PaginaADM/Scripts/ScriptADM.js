document.getElementById('botaoFiltrar').addEventListener('click', function () {
    const tipoFiltro = document.getElementById('tipoFiltro').value;
    const valorPesquisa = document.getElementById('pesquisar').value;

    switch (tipoFiltro) {
        case 'ID':
            // Lógica para filtro por ID
            break;

        case 'Nome':
            // Lógica para filtro por Nome
            break;

        case 'Code':
            // Lógica para filtro por Code
            break;

        case 'Reagente':
            // Lógica para filtro por Reagente
            break;

        case 'Data':
            const datas = valorPesquisa.split('-');
            const dataInicial = datas[0];
            const dataFinal = datas[1] || dataInicial;

            const url = `/DadosPorData?dataInicial=${dataInicial}&dataFinal=${dataFinal}`;

            fetch(url)
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
