const reagenteInput = document.getElementById('pesquisar')
const dropdown = document.getElementById('dropdown');

document.addEventListener('DOMContentLoaded', () => {
  getReagentes();
});

reagenteInput.addEventListener('focus', () => {
  dropdown.style.display = 'block';
  document.getElementById('dropdownIcon').style.transform = 'rotate(180deg)';
});

reagenteInput.addEventListener('blur', () => {
  setTimeout(() => {
    dropdown.style.display = 'none';
    document.getElementById('dropdownIcon').style.transform = 'rotate(0deg)';
  }, 240);
});

document.getElementById('dropdownIcon').addEventListener('click', () => {
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  document.getElementById('dropdownIcon').style.transform = dropdown.style.display === 'block' ? 'rotate(180deg)' : 'rotate(0deg)';
  reagenteInput.focus();
});

document.querySelectorAll('input[name="medida"]').forEach(input => {
  input.addEventListener('change', () => {
    if(document.getElementById('outros').checked) {
      document.getElementById('outros-texto').hidden = false;
      document.getElementById('mensagemErroOutros').style.display = 'none';
    } else {
      document.getElementById('outros-texto').hidden = true;
      document.getElementById('outros-texto').value = '';
      document.getElementById('mensagemErroOutros').style.display = 'none';
    }
  });
});

function handleInput() {
  const reagentes = document.querySelectorAll('.reagentes');
  reagenteInput.addEventListener('input', () => {
    reagentes.forEach(reagente => {
      const reagenteValue = reagenteInput.value.trim().toLowerCase();
      if(reagente.textContent.toLowerCase().includes(reagenteValue)) {
        reagente.style.display = 'block';
      } else {
        reagente.style.display = 'none';
      }
    });
  });
}

function handleClick() {
  const reagentes = document.querySelectorAll('.reagentes');
  reagentes.forEach(reagente => {
    reagente.addEventListener('click', () => {
      let reagenteValue = reagente.textContent.trim();
      reagenteInput.value = reagenteValue;
      dropdown.style.display = 'none';
      document.getElementById('dropdownIcon').style.transform = 'rotate(0deg)';
      document.getElementById('mensagemErroReag').style.display = 'none';
      validateReagente();
    });
  });
}

function validateQuantidade() {
  let quantidade = document.getElementById('quantidade').value.trim();
  quantidade = quantidade.replace(/\./g, ',');
  quantidade = quantidade.replace(/[^0-9,]/g, '.');
  quantidade = parseInt(quantidade);

  document.getElementById('mensagemErroQtd').style.display = 'none';

  if(isNaN(quantidade) || quantidade <= 0 || quantidade > 99999 || quantidade === '') {
    document.getElementById('mensagemErroQtd').textContent = isNaN(quantidade) ? 'Quantidade inválida' : 'Quantidade deve ser maior que 0';
    document.getElementById('mensagemErroQtd').style.display = 'block';
  } else {
    document.getElementById('mensagemErroQtd').style.display = 'none';
  }
}

function validateReagente() {
  const reagentes = document.querySelectorAll('.reagentes');
  const reagente = document.getElementById('pesquisar').value.trim().toLowerCase();
  document.getElementById('mensagemErroReag').style.display = 'none';

  if (reagente === '') {
    document.getElementById('mensagemErroReag').textContent = 'Selecione um reagente válido';
    document.getElementById('mensagemErroReag').style.display = 'block';
  }

  const validOptions = Array.from(reagentes).map(reagente => reagente.textContent.trim().toLowerCase());
  if(!validOptions.includes(reagente)) {
    document.getElementById('mensagemErroReag').textContent = 'Selecione um reagente válido';
    document.getElementById('mensagemErroReag').style.display = 'block';
  }
}

function validateResponsavel() {
  const responsavel = document.getElementById('responsavel').value.trim().toLowerCase();
  document.getElementById('mensagemErroResp').style.display = 'none';

  if (responsavel === '') {
    document.getElementById('mensagemErroResp').textContent = 'Digite um nome válido';
    document.getElementById('mensagemErroResp').style.display = 'block';
  } 
}

function validateOutros() {
  const outros = document.getElementById('outros-texto').value.trim().toLowerCase();
  document.getElementById('mensagemErroOutros').style.display = 'none';

  if (document.getElementById('outros').checked && outros === '') {
    document.getElementById('mensagemErroOutros').textContent = 'Campo obrigatório';
    document.getElementById('mensagemErroOutros').style.display = 'block';
  }
}

document.getElementById('quantidade').addEventListener('blur', validateQuantidade);
document.getElementById('pesquisar').addEventListener('blur', validateReagente);
document.getElementById('responsavel').addEventListener('blur', validateResponsavel);
document.getElementById('outros-texto').addEventListener('blur', validateOutros);

document.getElementById('btnEnviar').addEventListener('click', () => {
  const responsavel = document.getElementById('responsavel').value.trim();
  const quantidade = document.getElementById('quantidade').value.trim();
  let reagente = document.getElementById('pesquisar').value.trim();
  const indexSplit = reagente.indexOf(' - ');
  let codigo = '';
  if (indexSplit !== -1) {
    codigo = reagente.substring(0, indexSplit).trim();
    reagente = reagente.substring(indexSplit + 3).trim();
  } else {
    codigo = reagente;
    reagente = '';
  }
  const lote = document.getElementById('lote').value.trim();
  const medida = document.querySelector('input[name="medida"]:checked');
  const outros = document.getElementById('outros-texto').value.trim();
  const observacao = document.getElementById('observacao').value.trim();

  if(responsavel === '' || quantidade === '' || reagente === '' || !medida || (document.getElementById('outros').checked && outros === '')) {
    toastAlert('warn', 'Preencha todos os campos corretamente');
    return;
  }

  fetch('/api/answers/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      responsavel,
      codigo,
      reagente,
      lote,
      quantidade,
      medida: medida.value === 'Outros' ? medida.value + ' - ' + outros : medida.value,
      observacao
    })
  })
  .then((response) => {
    if(response.ok && response.status === 201) {
      window.location.href = '/envio';
    } else {
      toastAlert('error', 'Erro ao enviar o formulário');
    }
  })
});

function getReagentes() {
  fetch('/api/reagentes/forms', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then((response) => response.json())
  .then((data) => {
    if(data.error) {
      console.error('Erro ao buscar os reagentes:', data.error);
      toastAlert('error', 'Erro ao buscar os reagentes');
      return;
    }
    if(data) {
      document.getElementById('dropdown').innerHTML = `
        ${data.reagentes.map(reagente => `
          <li class="reagentes">
            ${reagente.codigo} - ${reagente.reagente}
          </li>
        `).join('')}
      `;
      handleInput();
      handleClick();
    }
  })
}