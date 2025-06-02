document.addEventListener('DOMContentLoaded', () => {
    getAuthHeaders();
    getData('/api/answers');
    getData('/api/reagentes');
    addSidebar();
});

let pagination = {
    respostas: { current: 1, total: 1 },
    reagentes: { current: 1, total: 1 }
}

let filters = {
    respostas: '',
    reagentes: '',
}

const navRespostas = document.querySelector('.nav-btn.active, .nav-btn#navRespostas') || document.querySelector('.nav-btn');
const navReagentes = document.querySelector('.nav-btn#navReagentes');
const secRespostas = document.getElementById('secRespostas');
const secReagentes = document.getElementById('secReagentes');
const sidebarFiltros = document.querySelector('.sidebar-filtros') || document.getElementById('sidebarFiltros');
const sidebarReagentes = document.querySelector('.sidebar-reagentes') || document.getElementById('sidebarReagentes');

const btnNovoReagente = document.querySelector('.btn-confirm i.fa-plus')?.parentElement;
const btnEntradaReagente = document.querySelector('.btn-confirm i.fa-arrow-up')?.parentElement;
const btnSaidaReagente = document.querySelector('.btn-cancel i.fa-arrow-down')?.parentElement;

const modalReagente = document.getElementById('modalReagente');
const modalEntradaReagente = document.getElementById('modalEntradaReagente');
const modalSaidaReagente = document.getElementById('modalSaidaReagente');
const modalDelete = document.getElementById('modalDelete');
const overlay = document.getElementById('overlay');

navRespostas.addEventListener('click', function() {
    secRespostas.style.display = 'block';
    secReagentes.style.display = 'none';
    this.classList.add('active');
    navReagentes.classList.remove('active');
    sidebarFiltros.style.display = 'block';
    sidebarReagentes.style.display = 'none';
});

navReagentes.addEventListener('click', function() {
    secRespostas.style.display = 'none';
    secReagentes.style.display = 'block';
    this.classList.add('active');
    navRespostas.classList.remove('active');
    sidebarFiltros.style.display = 'none';
    sidebarReagentes.style.display = 'block';
});

document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.addEventListener('click', function() {
        const sidebarContent = this.closest('.sidebar-content');
        const inputs = sidebarContent.querySelectorAll('input');
        const selects = sidebarContent.querySelectorAll('select');
        let queryParams = '';
        let order = '';

        selects.forEach(select => {
            if (select.value) {
                queryParams += `${select.value}=`;
                order = `${select.value} asc`;
            }
        });
        
        inputs.forEach(input => {
            if (input.value) {
                queryParams += `${input.value}`;
            }
        });

        const url = sidebarContent.classList.contains('sidebar-reagentes') ? '/api/reagentes' : '/api/answers';
        if(url === '/api/answers') {
            filters.respostas = queryParams;
            getData(url, order, 1, filters.respostas);
        } else {
            filters.reagentes = queryParams;
            getData(url, order, 1, filters.reagentes);
        }
    });
});

document.querySelectorAll('.btn-clear').forEach(btn => {
    btn.addEventListener('click', () => {
        this.closest('.sidebar-content').querySelectorAll('input').forEach(input => input.value = '');
        filters.respostas = '';
        filters.reagentes = '';
        getData('/api/answers');
        getData('/api/reagentes');
    });
});

btnNovoReagente.addEventListener('click', () => {
    setReagenteFieldsReadOnly(false);
    document.getElementById('modalReagenteTitulo').innerText = 'Novo Reagente';
    modalReagente.style.display = 'block';
    overlay.style.display = 'block';
});

btnEntradaReagente.addEventListener('click', () => {
    modalEntradaReagente.style.display = 'block';
    overlay.style.display = 'block';
});

btnSaidaReagente.addEventListener('click', () => {
    modalSaidaReagente.style.display = 'block';
    overlay.style.display = 'block';
});

document.querySelectorAll('.btnsCancel').forEach(btn => {
    btn.addEventListener('click', closeModalReagente);
});

document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeModalReagente);
});

overlay.addEventListener('click', closeModalReagente);

document.getElementById('formEntradaReagente')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const codigo = document.getElementById('codigoEntrada').value;
    const quantidade = document.getElementById('quantidadeEntrada').value;
    const url = '/api/reagentes/add';
    alterStock(url, codigo, quantidade);
    closeModalReagente();
    clearFields();
});

document.getElementById('formSaidaReagente')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const codigo = document.getElementById('codigoSaida').value;
    const quantidade = document.getElementById('quantidadeSaida').value;
    const url = '/api/reagentes/remove';
    alterStock(url, codigo, quantidade);
    closeModalReagente();
    clearFields();
});

document.getElementById('salvarReagente')?.addEventListener ('click', (e) => {
    e.preventDefault();
    let url = '/api/reagentes';
    let method = document.getElementById('salvarReagente').classList.contains('edit') ? 'PUT' : 'POST';
    if (method === 'PUT') url = url+=`/${document.getElementById('salvarReagente').getAttribute('data-id')}`;
    sendData(url, method);
    closeModalReagente();
});

document.getElementById('tbodyRespostas')?.addEventListener('click', (e) => {
    if(e.target.classList.contains('acao-btn')) {
        const id = e.target.getAttribute('data-id');
        const name = e.target.getAttribute('data-name') || '';
        if(e.target.title === 'Excluir') {
            const url = '/api/answers';
            deleteData(url, id, name);
        }
    }
});

document.getElementById('tbodyRespostas')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.acao-btn');
    if(btn) {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name') || '';
        if(btn.title === 'Excluir') {
            const url = '/api/answers';
            deleteData(url, id, name);
        }
    }
});

document.getElementById('tbodyReagentes').addEventListener('click', (e) => {
    const btn = e.target.closest('.acao-btn');
    if (btn) {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name') || '';
        if (btn.title === 'Detalhes') {
            showDetails(id);
        } else if (btn.title === 'Editar') {
            document.getElementById('salvarReagente').classList.add('edit');
            editReagente(id);
        } else if (btn.title === 'Excluir') {
            const url = '/api/reagentes';
            deleteData(url, id, name);
        }
    }
});

document.getElementById('btnAnteriorRespostas').addEventListener('click', () => {
    if (pagination.respostas.current > 1) {
        getData('/api/answers', '', pagination.respostas.current - 1, filters.respostas);
    }
});
document.getElementById('btnProximoRespostas').addEventListener('click', () => {
    if (pagination.respostas.current < pagination.respostas.total) {
        getData('/api/answers', '', pagination.respostas.current + 1, filters.respostas);
    }
});
document.getElementById('btnAnteriorReagentes').addEventListener('click', () => {
    if (pagination.reagentes.current > 1) {
        getData('/api/reagentes', '', pagination.reagentes.current - 1, filters.reagentes);
    }
});
document.getElementById('btnProximoReagentes').addEventListener('click', () => {
    if (pagination.reagentes.current < pagination.reagentes.total) {
        getData('/api/reagentes', '', pagination.reagentes.current + 1, filters.reagentes);
    }
});

document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeModalReagente);
});

document.querySelectorAll('.btnsCancel').forEach(btn => {
    btn.addEventListener('click', closeModalReagente);
});

overlay.addEventListener('click', closeModalReagente)

function deleteData(url, id, name) {
    document.getElementById('modalDelete').style.display = 'block';
    overlay.style.display = 'block';
    document.getElementById('modalDeleteTexto').innerText = `Você tem certeza que deseja excluir o item: ${name}?`;
    document.getElementById('confirmDelete').addEventListener('click', () => {
        fetch(`${url}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
        .then(response => {
            if(response.status === 204) {
                toastAlert('success', 'Item excluído com sucesso');
                getData(url);
            } else {
                toastAlert('error', 'Erro ao excluir o item');
                console.error('Erro ao excluir o item:', response);
            }
        });
        closeModalReagente();
    });
}

function closeModalReagente() {
    modalSaidaReagente.style.display = 'none';
    modalEntradaReagente.style.display = 'none';
    overlay.style.display = 'none';
    modalReagente.style.display = 'none';
    modalDelete.style.display = 'none';
}

function clearFields() {
    document.getElementById('codigo').value = '';
    document.getElementById('reagente').value = '';
    document.getElementById('quantidade').value = '';
    document.getElementById('unidadeMedida').value = '';
    document.getElementById('dataRecebido').value = '';
    document.getElementById('situacao').value = '';
    document.getElementById('valorUnitario').value = '';
    document.getElementById('fornecedor').value = '';
    document.getElementById('lote').value = '';
    document.getElementById('validade').value = '';
    document.getElementById('localizacao').value = '';
    document.getElementById('limiteMin').value = '';
    document.getElementById('limiteMax').value = '';
    document.getElementById('codigoEntrada').value = '';
    document.getElementById('quantidadeEntrada').value = '';
    document.getElementById('codigoSaida').value = '';
    document.getElementById('quantidadeSaida').value = '';
}

function addSidebar() {
    const filtros = document.querySelector('.sidebar-filtros') || document.getElementById('sidebarFiltros');
    if (filtros && !document.getElementById('exportExcelRespostas')) {
        const btn = createExportButton('Respostas');
        btn.id = 'exportExcelRespostas';
        filtros.appendChild(btn);
    }
    const reagentesSidebar = document.querySelector('.sidebar-reagentes') || document.getElementById('sidebarReagentes');
    if (reagentesSidebar && !document.getElementById('exportExcelReagentes')) {
        const btn = createExportButton('Reagentes');
        btn.id = 'exportExcelReagentes';
        reagentesSidebar.appendChild(btn);
    }
}

function createExportButton(tabela) {
    const btn = document.createElement('button');
    btn.className = 'export-excel-btn';
    btn.innerHTML = `<i class="fa fa-file-excel"></i> Exportar ${tabela} para Excel`;
    btn.type = 'button';
    btn.addEventListener('click', () => createExcel(tabela));
    return btn;
}

function ajustDate(date) {
    const d = new Date(date);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0'); // Mês começa do zero
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
}

function addDataToTable(data, url) {
    if (url.includes('answers')) {
        const tbody = document.getElementById('tbodyRespostas');
        tbody.innerHTML = '';
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="no-data">Nenhum dado encontrado</td></tr>';
            return;
        }
        data.forEach(answer => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${answer.responsavel || '-'}</td>
                <td>${answer.codigo || '-'}</td>
                <td>${answer.reagente || '-'}</td>
                <td>${answer.quantidade ?? '-'}</td>
                <td>${answer.lote || '-'}</td>
                <td>${answer.medida || '-'}</td>
                <td>${answer.observacao || '-'}</td>
                <td>${answer.data ? ajustDate(answer.data) : '-'}</td>
                <td style="user-select: none;">
                    <button class="acao-btn" title="Excluir" data-id="${answer._id}" data-name="Responsável: ${answer.responsavel}"><i class="fa fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } else if (url.includes('reagentes')) {
        const tbody = document.getElementById('tbodyReagentes');
        tbody.innerHTML = '';
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="no-data">Nenhum dado encontrado</td></tr>';
            return;
        }
        data.forEach(reagente => {
            const tr = document.createElement('tr');
            let quantidadeCell = `${reagente.quantidade ?? '-'}`;
            if (reagente.nearLimit === true) {
                quantidadeCell += `<br><span class="near-limit-alert" style="user-select:none;"><i class='fa fa-exclamation-triangle'></i> Limite Mínimo Próximo</span>`;
            }
            tr.innerHTML = `
                <td>${reagente.codigo || '-'}</td>
                <td>${reagente.reagente || '-'}</td>
                <td>${quantidadeCell}</td>
                <td>${reagente.unidadeMedida || '-'}</td>
                <td>${reagente.localizacao || '-'}</td>
                <td>${reagente.situacao || '-'}</td>
                <td>${reagente.validade ? ajustDate(reagente.validade) : '-'}</td>
                <td style="user-select: none;">
                    <button class="acao-btn" title="Detalhes" data-id="${reagente._id}"><i class="fa fa-eye"></i></button>
                    <button class="acao-btn" title="Editar" data-id="${reagente._id}"><i class="fa fa-edit"></i></button>
                    <button class="acao-btn" title="Excluir" data-id="${reagente._id}" data-name="Reagente: ${reagente.reagente}"><i class="fa fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function showDetails(id) {
    fetch(`/api/reagentes/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    })
    .then(response => response.json())
    .then(data => viewDetails(data));
}

function setReagenteFieldsReadOnly(isReadOnly) {
    const fields = [
        'codigo', 'reagente', 'quantidade', 'unidadeMedida', 'dataRecebido',
        'situacao', 'valorUnitario', 'valorTotal', 'fornecedor', 'lote', 'validade',
        'localizacao', 'limiteMin', 'limiteMax'
    ];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (isReadOnly) {
                document.getElementById('salvarReagente').style.display = 'none';
                document.getElementById('totalValueGroup').style.display = 'block';
                el.setAttribute('readonly', 'readonly');
            } else {
                clearFields();
                document.getElementById('salvarReagente').style.display = 'block';
                document.getElementById('totalValueGroup').style.display = 'none';
                el.removeAttribute('readonly');
            }
        }
    });
}

function updatePagination(table) {
    let btnPriv, btnNext, info;
    if (table === 'respostas') {
        btnPriv = document.getElementById('btnAnteriorRespostas');
        btnNext = document.getElementById('btnProximoRespostas');
        info = document.getElementById('paginationInfoRespostas');
        btnPriv.disabled = pagination.respostas.current <= 1;
        btnNext.disabled = pagination.respostas.current >= pagination.respostas.total;
        info.innerHTML = `<span>Página <b>${pagination.respostas.current}</b> de <b>${pagination.respostas.total}</b></span>`;
    } else if (table === 'reagentes') {
        btnPriv = document.getElementById('btnAnteriorReagentes');
        btnNext = document.getElementById('btnProximoReagentes');
        info = document.getElementById('paginationInfoReagentes');
        btnPriv.disabled = pagination.reagentes.current <= 1;
        btnNext.disabled = pagination.reagentes.current >= pagination.reagentes.total;
        info.innerHTML = `<span>Página <b>${pagination.reagentes.current}</b> de <b>${pagination.reagentes.total}</b></span>`;
    }
}

function viewDetails(data) {
    modalReagente.style.display = 'block';
    overlay.style.display = 'block';
    const reagente = data;
    setReagenteFieldsReadOnly(true);
    document.getElementById('modalReagenteTitulo').innerText = `Detalhes do Reagente: ${reagente.reagente}`;
    document.getElementById('codigo').value = reagente.codigo || '';
    document.getElementById('reagente').value = reagente.reagente || '';
    document.getElementById('quantidade').value = reagente.quantidade || '';
    document.getElementById('unidadeMedida').value = reagente.unidadeMedida || '';
    document.getElementById('dataRecebido').value = reagente.dataRecebido ? new Date(reagente.dataRecebido).toISOString().split('T')[0] : '';
    document.getElementById('situacao').value = reagente.situacao || '';
    document.getElementById('valorUnitario').value = reagente.valorUnitario || '';
    document.getElementById('valorTotal').value = `R$:${parseFloat(reagente.valorTotal).toFixed(2)}` || '';
    document.getElementById('fornecedor').value = reagente.fornecedor || '';
    document.getElementById('lote').value = reagente.lote || '';
    document.getElementById('validade').value = reagente.validade ? new Date(reagente.validade).toISOString().split('T')[0] : '';
    document.getElementById('localizacao').value = reagente.localizacao || '';
    document.getElementById('limiteMin').value = reagente.limiteMin || '';
    document.getElementById('limiteMax').value = reagente.limiteMax || '';
}

function editReagente(id) {
    modalReagente.style.display = 'block';
    overlay.style.display = 'block';
    fetch(`/api/reagentes/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    })
    .then(response => response.json())
    .then(data => {
        if(data.error) {
            toastAlert('error', 'Erro ao buscar o reagente');
            console.error('Erro ao buscar o reagente:', data.error);
            return;
        }
        const reagente = data;
        setReagenteFieldsReadOnly(false);
        document.getElementById('codigo').value = reagente.codigo || '';
        document.getElementById('reagente').value = reagente.reagente || '';
        document.getElementById('quantidade').value = reagente.quantidade || '';
        document.getElementById('unidadeMedida').value = reagente.unidadeMedida || '';
        document.getElementById('dataRecebido').value = reagente.dataRecebido ? new Date(reagente.dataRecebido).toISOString().split('T')[0] : '';
        document.getElementById('situacao').value = reagente.situacao || '';
        document.getElementById('valorUnitario').value = reagente.valorUnitario || '';
        document.getElementById('fornecedor').value = reagente.fornecedor || '';
        document.getElementById('lote').value = reagente.lote || '';
        document.getElementById('validade').value = reagente.validade ? new Date(reagente.validade).toISOString().split('T')[0] : '';
        document.getElementById('localizacao').value = reagente.localizacao || '';
        document.getElementById('limiteMin').value = reagente.limiteMin || '';
        document.getElementById('limiteMax').value = reagente.limiteMax || '';
        document.getElementById('modalReagenteTitulo').innerText = `Editar Reagente: ${reagente.reagente}`;
        document.getElementById('salvarReagente').setAttribute('data-id', id);
    });
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if(!token) return res.redirect('/login');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

function createExcel(table) {
    const url = table === 'Respostas' ? '/api/answers/excel' : '/api/reagentes/excel';
    fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
    })
    .then(response => {
        if(response.status === 200) {
            return response.blob();
        } else {
            toastAlert('error', 'Erro ao gerar o Excel');
            console.error('Erro ao gerar o Excel:', response);
        }
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${table}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    });
}

function getData(url, order, page, filter) {
    const finalUrl = url + `?filter=${filter || ''}&_order=${order || 'createdAt desc'}&_page=${page || 1}&_size=10`;
    fetch(finalUrl, {
        method: 'GET',
        headers: getAuthHeaders(),
    })
    .then(response => response.json())
    .then(data => {
        if(data.error) {
            console.error('Erro ao buscar os dados:', data.error);
            toastAlert('error', 'Erro ao buscar as respostas');
            return;
        } else {
            addDataToTable(data.data, url);
            if(url.includes('answers')) {
                pagination.respostas.current = data._page?.current || 1;
                pagination.respostas.total = data._page?.total || 1;
                updatePagination('respostas');
            } else {
                pagination.reagentes.current = data._page?.current || 1;
                pagination.reagentes.total = data._page?.total || 1;
                updatePagination('reagentes');
            }
        }
    })
    .catch(error => {
        console.error('Erro ao buscar os dados:', error);
        toastAlert('error', 'Erro ao buscar as respostas');
    });
}

function sendData(url, method) {
    const codigo = document.getElementById('codigo').value;
    const reagente = document.getElementById('reagente').value;
    const quantidade = document.getElementById('quantidade').value;
    const unidadeMedida = document.getElementById('unidadeMedida').value;
    const dataRecebido = document.getElementById('dataRecebido').value;
    const situacao = document.getElementById('situacao').value;
    const valorUnitario = document.getElementById('valorUnitario').value;
    const fornecedor = document.getElementById('fornecedor').value;
    const lote = document.getElementById('lote').value;
    const validade = document.getElementById('validade').value;
    const localizacao = document.getElementById('localizacao').value;
    const limiteMin = document.getElementById('limiteMin').value;
    const limiteMax = document.getElementById('limiteMax').value;

    if(!codigo || !reagente || !quantidade || !unidadeMedida || !situacao || !valorUnitario) {
        toastAlert('warn', 'Preencha todos os campos obrigatórios');
        return;
    }

    fetch(url, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
            codigo,
            reagente,
            quantidade,
            unidadeMedida,
            dataRecebido,
            situacao,
            valorUnitario,
            fornecedor,
            lote,
            validade,
            localizacao,
            limiteMin,
            limiteMax
        })
    })
    .then(async response => {
        if(response.status === 201) {
            toastAlert('success', 'Reagente criado com sucesso');
            getData('/api/reagentes');
        } else if(response.status === 200) {
            toastAlert('success', 'Reagente atualizado com sucesso');
            document.getElementById('salvarReagente').classList.remove('edit');
            getData('/api/reagentes');
        } else if (await response.json().error.message.includes('duplicate key error')) {
            toastAlert('error', 'Código ja cadastrado');
            console.error('Erro ao enviar os dados:', await response.json());
        }
        closeModalReagente();
        clearFields();
    })
    .catch(error => {
        console.error('Erro ao enviar os dados:', error);
        toastAlert('error', 'Erro ao enviar os dados');
        closeModalReagente();
        clearFields();
    });
}

function alterStock(url, codigo, quantidade) {
    if(!codigo || !quantidade) {
        toastAlert('warn', 'Preencha todos os campos obrigatórios');
        return;
    }

    fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            codigo,
            quantidade
        })
    })
    .then(response => {
        if(response.status === 200) {
            toastAlert('success', 'Estoque atualizado com sucesso');
            getData('/api/reagentes');
            closeModalReagente();
            clearFields();
        } else {
            toastAlert('error', 'Erro ao atualizar o estoque');
            console.error('Erro ao atualizar o estoque:', response);
        }
    });
}