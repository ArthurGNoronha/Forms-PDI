const respInput = document.getElementById("responsavel");
const mensagemErroResp = document.getElementById("mensagemErroResp");
const numeroMedidaInput = document.getElementById("quantidade");
const mensagemErroQtd = document.getElementById("mensagemErroQtd");
const mensagemErroReag = document.getElementById("mensagemErroReag");
var outrosCheckbox = document.getElementById("outros");
const valorOutros = document.getElementById("outros-texto");
const mensagemErroOutros = document.getElementById("mensagemErroOutros");
const MENSAGEM_ERRO_GERAL = "Esse campo é obrigatório!";
var opcaoSelecionada = "";
const dropdownIcon = document.getElementById("dropdown-icon");
const valorPesquisa = document.getElementById("pesquisar");
const dropdown = document.getElementById("dropdown");
const options = document.querySelectorAll("#dropdown li");
let angle = 0

valorPesquisa.addEventListener('focus', () => {
  angle += 180;
  dropdown.style.display = 'block';
  dropdownIcon.style.transform = `rotate(${angle}deg)`;
});

valorPesquisa.addEventListener('blur', () => {
  angle += 180;
  setTimeout(() => {
    dropdown.style.display = 'none';
    dropdownIcon.style.transform = `rotate(${angle}deg)`;
  }, 240);
});

valorPesquisa.addEventListener('input', () => {
  const escrito = valorPesquisa.value.toLowerCase();

  options.forEach(option => {
    const optionText = option.innerText.toLowerCase();
    if (optionText.includes(escrito)) {
      option.style.display = 'block';
    } else {
      option.style.display = 'none';
    }
  });
});

dropdownIcon.addEventListener('click', () => {
  angle += 180;
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';

  if (dropdownIcon.style) {
      dropdownIcon.style.transform = `rotate(${angle}deg)`;
  }
});

options.forEach(option => {
  option.addEventListener('click', () => {
    valorPesquisa.value = '';
    opcaoSelecionada = option.innerText;
    valorPesquisa.value = opcaoSelecionada;
    dropdown.style.display = 'none';

    mensagemErroReag.textContent = "";
    mensagemErroReag.style.display = 'none';
  });
});

document.getElementById("outros").addEventListener("change", () => {
  var outrosTexto = document.getElementById("outros-texto");
  outrosTexto.hidden = !this.checked;
  
  if (!this.checked) {
    outrosTexto.value = "";
    outrosTexto.removeAttribute("required"); 
  } else {
    outrosTexto.focus();
    outrosTexto.setAttribute("required", "required"); 
  }
});

var outrasOpcoes = document.querySelectorAll('input[name="medida"]');
outrasOpcoes.forEach((opcao) => {
  opcao.addEventListener('change', () => {
    var outrosTexto = document.getElementById("outros-texto");
    if (!document.getElementById("outros").checked) {
      outrosTexto.hidden = true;
      outrosTexto.value = "";
      mensagemErroOutros.textContent = "";
      mensagemErroOutros.style.display = 'none';
    }
  });
});

numeroMedidaInput.addEventListener("blur", validarNumero);

function validarNumero() {
  let numeroMedidaTexto = numeroMedidaInput.value.trim();
  
  numeroMedidaTexto = numeroMedidaTexto.replace(/\./g, ',');
  
  numeroMedidaTexto = numeroMedidaTexto.replace(/[^0-9,]/g, '');
  
  const numeroMedida = parseFloat(numeroMedidaTexto.replace(/,/g, '.'));

  mensagemErroQtd.textContent = "";
  mensagemErroQtd.style.display = 'none';

  if (isNaN(numeroMedida) || numeroMedida < 0 || numeroMedida > 9999999) {
    mensagemErroQtd.textContent = isNaN(numeroMedida)
      ? "Por favor, insira um número válido."
      : numeroMedida < 0
      ? "O número não pode ser negativo!"
      : "Número é maior do que o permitido!";
      
    setTimeout(() => {
      numeroMedidaInput.value = "";
      mensagemErroQtd.style.display = 'block';
    }, 120);
  } else {
    numeroMedidaInput.value = numeroMedidaTexto;
    mensagemErroQtd.style.display = 'none';
  }
}
  
dropdown.addEventListener("change",validarReag);
valorPesquisa.addEventListener("blur", validarReag); 
  
function validarReag() {
  var valorReag = valorPesquisa.value;
  
  mensagemErroReag.textContent = "";
  mensagemErroReag.style.display = 'none';
  
  if (valorReag === '') {
    mensagemErroReag.textContent = MENSAGEM_ERRO_GERAL;
    mensagemErroReag.style.display = 'block';
    valorPesquisa.value = "";
  }
}

respInput.addEventListener("blur", validarResp);

function validarResp(){
  var nomeResp = respInput.value.trimStart();

  mensagemErroResp.textContent = "";
  mensagemErroResp.style.display = 'none';

  if (nomeResp === '' ){
    mensagemErroResp.textContent = MENSAGEM_ERRO_GERAL;
    mensagemErroResp.style.display = 'block';
  } 
}

valorOutros.addEventListener("blur", validarOutros);

function validarOutros() {
  const outrosInput = valorOutros.value.trimStart();
  
  mensagemErroOutros.textContent = "";
  mensagemErroOutros.style.display = 'none';

  if (outrosCheckbox.checked && outrosInput === "") {
    setTimeout(() => {
      mensagemErroOutros.textContent = MENSAGEM_ERRO_GERAL;
      mensagemErroOutros.style.display = 'block';
      valorOutros.value = "";
    }, 62);
  }
}

outrosCheckbox.addEventListener("change", () => {
  mensagemErroOutros.textContent = "";
  mensagemErroOutros.style.display = 'none';
});

document.getElementById("btnEnviar").addEventListener("click", () => {
  const resp = document.getElementById("responsavel");
  const valorResp = resp.value.trim();
  const quantidade = document.getElementById("quantidade");
  const valorQtd = quantidade.value.trim();
  const medida = document.querySelector('input[name="medida"]:checked');
  const reagente = document.getElementById("pesquisar");
  const valorReagente = reagente.value.trim();
  const outrosCheckbox = document.getElementById("outros");
  const outrosValor = document.getElementById("outros-texto").value.trimStart();
  const observacao = document.getElementById("observacao").value;
  const opcoesValidas = Array.from(options).map(option => option.innerText.toUpperCase().trim());

  if (valorResp === "" || valorQtd === "" || medida === null || valorReagente === "") {
    toastAlert('warn', `Por favor, preencha todos os campos obrigatórios antes de enviar!`);
  } else if (outrosCheckbox.checked && outrosValor === '') {
    toastAlert('warn', 'A opção "Outros" é obrigatória!');
  } else if (!opcoesValidas.includes(valorReagente.toUpperCase())) {
    mensagemErroReag.textContent = 'Por favor, selecione uma opção válida';
    mensagemErroReag.style.display = 'block';
    reagente.value = '';
  } else {
    var dados = {
      responsavel: valorResp,
      quantidade: valorQtd,
      medida: medida ? medida.value : "",
      outros: outrosCheckbox.checked ? outrosValor : "",
      observacao: observacao,
      reagente: valorReagente
    };

    fetch('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error('Erro ao enviar os dados: ', data.error);
        toastAlert('error', 'Erro ao enviar os dados');

        if (data.error === 'Reagente Inválido') {
          toastAlert('error', 'Opção inválida selecionada. Por favor, escolha uma opção válida.');
          valorReagente = '';
          mensagemErroReag.textContent = 'Por favor, selecione uma opção válida!';
          mensagemErroReag.style.display = 'block';
        }
      } else if(data.redirect){
        window.location.href = data.redirect;
      }
    })
    .catch((error) => {
      toastAlert('error', 'Erro ao enviar os dados');
      console.error('Erro ao enviar os dados', error);
    });
  }
});