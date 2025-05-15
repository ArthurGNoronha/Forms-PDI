const dropdown = document.getElementById('dropdown');
const overlay = document.getElementById('overlay');
const divEdit = document.getElementById('divEdit');
const divReag = document.getElementById('divReag');
const divDel = document.getElementById('divDel');
const nextBtn = document.getElementById('btnProximo');
const prevBtn = document.getElementById('btnAnterior');
var currentPage;
let currentId;

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

document.addEventListener('DOMContentLoaded', () => {
    if(!localStorage.getItem('token')) {
        window.location.href = '/login';
    }
    currentPage = 1;
    nextDataPage();
});

function addTableLines(data) {
    const table = document.querySelector('.respostasEnv');

    const oldLines = document.querySelectorAll('.respostasDB');
    oldLines.forEach(line => line.remove());

    if(data.length === 0) {
        const newLines = document.createElement('tr');
        newLines.innerHTML = '<td colspan="8">Nenhum registro encontrado</td>';
        table.appendChild(newLines);
        return;
    }

    data.forEach(item => {
        const newLines = document.createElement('tr');
        newLines.innerHTML = `
            <td class="respostasDB">${item.id}</td>
            <td class="respostasDB">${item.Responsavel}</td>
            <td class="respostasDB">${item.CodigoReagente}</td>
            <td class="respostasDB">${item.Reagente}</td>
            <td class="respostasDB">${item.Quantidade}</td>
            <td class="respostasDB">${item.Medida}</td>
            <td class="respostasDB">${item.Observacao}</td>
            <td class="respostasDB">${item.Data}</td>
        `;

        table.appendChild(newLines);
    });
}

function addFilterLines(data, limit) {
    const respFiltradas = document.querySelector('.respfiltradas');

    const oldLines = document.querySelectorAll('.novaResposta');
    oldLines.forEach(line => line.remove());

    if(data.length === 0) {
        const newLines = document.createElement('div');
        newLines.innerHTML = '<p>Nenhum registro encontrado</p>';
        respFiltradas.appendChild(newLines);
        return;
    }

    data.slice(0, limit).forEach(item => {
        const newLines = document.createElement('div');
        newLines.className = 'novaResposta';
        newLines.innerHTML = `
            <div class="containerTextos">
                <div class="nomeFiltro">Nome: ${item.Responsavel}</div>
                <div class="dataFiltro">${item.Data}</div>
                <div class="idFiltro">ID: ${item.id}</div>
            </div>
            <img class="editar"
                data-id="${item.id}"
                data-Responsavel="${item.Responsavel}"
                data-Code="${item.CodigoReagente}"
                data-Reag="${item.Reagente}"
                data-Qtd="${item.Quantidade}"
                data-Med="${item.Medida}"
                data-Outros="${item.Outros}"
                data-Obs="${item.Observacao}"
                src="/Imagens/edit.webp" alt="Editar">
            <img class="deletar"
                data-id="${item.id}"
                data-Responsavel="${item.Responsavel}"
                data-DataHora="${item.Data}"
                src="/Imagens/delete.webp" alt="Deletar">
        `;

        respFiltradas.appendChild(newLines);
    });
}

nextBtn.addEventListener('click', () => {
    currentPage++;
    nextDataPage();
});

prevBtn.addEventListener('click', () => {
    if(currentPage > 1) {
        currentPage--;
        nextDataPage();
    }
});

document.querySelector('.respfiltradas').addEventListener('click', async (event) => {
    const element = event.target;

    if(element.classList.contains('editar')) {
        currentId = element.getAttribute('data-id');
        document.getElementById('Responsavel').value = element.getAttribute('data-responsavel');
        document.getElementById('Codigo').value = element.getAttribute('data-code');
        document.getElementById('Reagente').value = element.getAttribute('data-reag');
        document.getElementById('Quantidade').value = element.getAttribute('data-qtd');
        document.getElementById('Medida').value = element.getAttribute('data-med');
        document.getElementById('Outros').value = element.getAttribute('data-outros');
        document.getElementById('Observacao').value = element.getAttribute('data-obs');
        overlay.style.display = 'block';
        divEdit.style.display = 'block';
    }

    if(element.classList.contains('deletar')) {
        currentId = element.getAttribute('data-id');
        overlay.style.display = 'block';
        divDel.style.display = 'block';
    }
});

overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
    divEdit.style.display = 'none';
    divDel.style.display = 'none';
    divReag.style.display = 'none';
});

document.querySelectorAll('btnsCancel').forEach(btn => {
    btn.addEventListener('click', () => {
        overlay.style.display = 'none';
        divEdit.style.display = 'none';
        divDel.style.display = 'none';
        divReag.style.display = 'none';
    });
});

document.getElementById('confirmDelete').addEventListener('click', async () => {
    const response = await fetch(`/adm/respostas/${currentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if(response.ok) {
        overlay.style.display = 'none';
        divDel.style.display = 'none';
        toastAlert('success', 'Resposta deletada com sucesso');
        nextDataPage();
    } else {
        const data = await response.json();
        toastAlert('error', 'Erro ao deletar a resposta');
        console.error(data.error);
    }
});

document.getElementById('tipoFiltro').addEventListener('change', () => {
    const campo = document.getElementById('pesquisar');
    const tipoFiltro = document.getElementById('tipoFiltro').value;

    if (tipoFiltro === 'ID'){
        campo.placeholder = 'Digite o ID da resposta';
    } else if (tipoFiltro === 'Nome') {
        campo.placeholder = 'Digite o nome do Responsável';
    } else if (tipoFiltro === 'Code') {
        campo.placeholder = 'Digite o Código do Reagente';
    } else if (tipoFiltro === 'Reagente') {
        campo.placeholder = 'Digite o Reagente utilizado';
    } else if (tipoFiltro === 'Data' ) {
        campo.placeholder = '(DD/MM/YYYY) Inicio - Fim';
    } else {
        campo.placeholder = 'Verifique a opção escolhida!';
    }
});

document.getElementById('botaoFiltrar').addEventListener('click', () => {
    const type = document.getElementById('tipoFiltro').value;
    const value = document.getElementById('pesquisar').value;

    fetch('/adm/data/search', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, value })
    })
    .then(response => response.json())
    .then(data => {
        if(data.error) {
            toastAlert('error', 'Erro ao filtrar os dados');
            console.error('Erro ao filtrar os dados:', data.error);
            return;
        }
        addTableLines(data.respostas);
        addFilterLines(data.respostas, 6);
    })
    .catch(error => {
        toastAlert('error', 'Erro ao filtrar os dados');
        console.error('Erro ao filtrar os dados:', error);
    });
});

document.getElementById('removeFiltro').addEventListener('click', async () => {
    document.getElementById('pesquisar').value = '';
    currentPage = 1;
    nextDataPage();
});

function nextDataPage() {
    fetch('/adm/data', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentPage)
    })
    .then(response => response.json())
    .then(data => {
        if(data.error) {
            toastAlert('error', 'Erro ao carregar os dados');
            console.error(data.error);
            return;
        }
        addTableLines(data.respostas);
        addFilterLines(data.respostas, 6);
    })
}

document.getElementById('btnReag').addEventListener('click', () => {
    overlay.style.display = 'block';
    divReag.style.display = 'block';
});

document.getElementById('pesquisarReag').addEventListener('focus', () => dropdown.style.display = 'block');

document.getElementById('pesquisarReag').addEventListener('blur', () => {
    setTimeout(() => {
        dropdown.style.display = 'none';
    }, 200);
});

document.getElementById('pesquisarReag').addEventListener('input', () => {
    const opcaoSelecionada = document.getElementById('pesquisarReag').value;
    const reagentes = document.querySelectorAll('.reagente');

    reagentes.forEach(reagente => {
        if(reagente.textContent.toUpperCase().includes(opcaoSelecionada.toUpperCase())) {
            reagente.style.display = 'block';
        } else {
            reagente.style.display = 'none';
        }
    });
});

document.querySelectorAll('li').forEach(reagente => {
    reagente.addEventListener('click', () => {
        document.getElementById('pesquisarReag').value = reagente.textContent;
        dropdown.style.display = 'none';
    });
});

document.getElementById('simReag').addEventListener('click', () => {
    const codigo = document.getElementById('newCode').value.trim();
    const reagente = document.getElementById('newReag').value;

    fetch('/reagentes/', {
        method: 'POST',
        headers: getAuthHeaders(),
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ codigo, reagente })
    })
    .then(response => response.json())
    .then(data => {
        if(data.message) {
            toastAlert('success', data.message);
            divReag.style.display = 'none';
            overlay.style.display = 'none';
            document.getElementById('newCode').value = '';
            document.getElementById('newReag').value = '';
            location.reload();
        } else {
            console.error(data.error);
            toastAlert('error', 'Erro ao adicionar o reagente');
        }
    })
    .catch(error => {
        console.error(error);
        toastAlert('error', 'Erro ao adicionar o reagente');
    });
});

document.getElementById('simEdReag').addEventListener('click', () => {
    const codeEdit = document.getElementById('edCode').value.trim();
    const codigo = document.getElementById('newEdCode').value.trim();
    const reagente = document.getElementById('newEdReag').value.trim();

    fetch(`/reagentes/${codeEdit}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ codigo, reagente })
    })
    .then(response => response.json())
    .then(data => {
        if(data.message) {
            toastAlert('success', data.message);
            divReag.style.display = 'none';
            overlay.style.display = 'none';
            document.getElementById('edCode').value = '';
            document.getElementById('newEdCode').value = '';
            document.getElementById('newEdReag').value = '';
            location.reload();
        } else {
            console.error(data.error);
            toastAlert('error', data.error);
        }
    })
    .catch(error => {
        console.error(error);
        toastAlert('error', 'Erro ao editar o reagente');
    });
});

document.getElementById('simExReag').addEventListener('click', () => {
    const codeDel = document.getElementById('exCode').value.trim();

    fetch(`/reagentes/${codeDel}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    })
    .then(response => response.json())
    .then(data => {
        if(data.message) {
            toastAlert('success', data.message);
            divReag.style.display = 'none';
            overlay.style.display = 'none';
            document.getElementById('exCode').value = '';
            location.reload();
        } else {
            console.error(data.error);
            toastAlert('error', 'Erro ao deletar o reagente');
        }
    })
    .catch(error => {
        console.error(error);
        toastAlert('error', 'Erro ao deletar o reagente');
    });
});