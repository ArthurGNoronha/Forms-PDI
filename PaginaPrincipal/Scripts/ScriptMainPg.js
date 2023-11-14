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

// Criar um array das opções para validação
const opcoesValidas = Array.from(options).map(option => option.innerText.toLowerCase());

valorPesquisa.addEventListener('focus', function() {
  dropdown.style.display = 'block';
});

valorPesquisa.addEventListener('blur', function() {
  setTimeout(() => {
    dropdown.style.display = 'none';
  }, 240);
});

valorPesquisa.addEventListener('input', function() {
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

dropdownIcon.addEventListener('click', function() {
  angle += 180;
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';

  if (dropdownIcon.style) {
      dropdownIcon.style.transform = `rotate(${angle}deg)`;
  }
});

options.forEach(option => {
  option.addEventListener('click', function() {
    opcaoSelecionada = option.innerText;
    valorPesquisa.value = opcaoSelecionada;
    dropdown.style.display = 'none';

    mensagemErroReag.textContent = "";
  });
});

//Opcao outros label aparecer

document.getElementById("outros").addEventListener("change", function () {
  var outrosTexto = document.getElementById("outros-texto");
  outrosTexto.hidden = !this.checked;
  if (!this.checked) {
    outrosTexto.value = "";
  } else {
    outrosTexto.focus();
  }
});

var outrasOpcoes = document.querySelectorAll('input[name="medida"]');
outrasOpcoes.forEach(function(opcao) {
  opcao.addEventListener('change', function() {
    var outrosTexto = document.getElementById("outros-texto");
    if (!document.getElementById("outros").checked) {
      outrosTexto.hidden = true;
      outrosTexto.value = "";
      mensagemErroOutros.textContent = "";
    }
  });
});

//Validar Numero Medida

numeroMedidaInput.addEventListener("blur", validarNumero);

function validarNumero() {
  let numeroMedidaTexto = numeroMedidaInput.value.trim();
  numeroMedidaTexto = numeroMedidaTexto.replace(/[^0-9,.]/g, '');
  const numeroMedida = parseFloat(numeroMedidaTexto.replace(",", "."));

  mensagemErroQtd.textContent = "";

  if (isNaN(numeroMedida) || numeroMedida < 0 || numeroMedida > 99999) {
    mensagemErroQtd.textContent = isNaN(numeroMedida)
      ? "Por favor, insira um número válido."
      : numeroMedida < 0
      ? "O número não pode ser negativo!"
      : "Número é maior do que o permitido!"
      setTimeout(() => {
        numeroMedidaInput.value = "";
      }, 120);
    } else {
      numeroMedidaInput.value = numeroMedidaTexto;
    }
  }
  
//Validar Pesquisa
  
dropdown.addEventListener("change",validarReag)
valorPesquisa.addEventListener("blur", validarReag); 
  
function validarReag() {
  var valorReag = valorPesquisa.value;
  
  mensagemErroReag.textContent = "";
  
  if (valorReag === '') {
    mensagemErroReag.textContent = MENSAGEM_ERRO_GERAL;
    valorPesquisa.value = "";
  }
}

//Validar Responsável

respInput.addEventListener("blur", validarResp);

function validarResp(){
  var nomeResp = respInput.value.trimStart();

  mensagemErroResp.textContent = "";

  if (nomeResp === '' ){
    mensagemErroResp.textContent = MENSAGEM_ERRO_GERAL;
  } 
}

//Validar Outros

valorOutros.addEventListener("blur", validarOutros);

function validarOutros() {
  const outrosInput = valorOutros.value.trimStart();
  
  mensagemErroOutros.textContent = "";

  if (outrosCheckbox.checked && outrosInput === "") {
    setTimeout(function () {
      mensagemErroOutros.textContent = MENSAGEM_ERRO_GERAL;
      valorOutros.value = "";
    }, 62);
  }
}

outrosCheckbox.addEventListener("change", function () {
  mensagemErroOutros.textContent = "";
});

//Não preencheu todos os campos obrigatórios
document.getElementById("btnEnviar").addEventListener("click", function () {
  var resp = document.getElementById("responsavel");
  var valorResp = resp.value.trim();
  var quantidade = document.getElementById("quantidade");
  var valorQtd = quantidade.value.trim();
  var medida = document.querySelector('input[name="medida"]:checked');
  var reagente = document.getElementById("pesquisar");
  var valorReagente = reagente.value.trim();
  var outrosCheckbox = document.getElementById("outros");
  var outrosValor = document.getElementById("outros-texto").value.trimStart();
  var observacao = document.getElementById("observacao").value;

  if (valorResp === "" || valorQtd === "" || medida === null || valorReagente === "") {
      alert(`Por favor, preencha todos os campos obrigatórios antes de enviar!`);
  } else if (outrosCheckbox.checked && outrosValor === '') {
      alert('A opção "Outros" é obrigatória!');
  } else {

    this.disabled = true;
      // Dividir o valor do reagente em código e nome
      var partesReagente = valorReagente.split('-');
      var codigoReagente = partesReagente[0].trim();
      var nomeReagente = partesReagente.slice(1).join('-').trim();

      // Enviar os dados para o servidor
      var dados = {
        nomeResponsavel: valorResp,
        quantidade: valorQtd,
        medida: medida ? medida.value : "",
        codigoReagente: codigoReagente,
        nomeReagente: nomeReagente,
        outros: outrosCheckbox.checked ? outrosValor : "",
        observacao: observacao,
    };
  
    // Enviar os dados para o servidor
    fetch('/salvar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Redireciona para "/envio" após o sucesso
        window.location.href = data.redirectUrl;
      } else {
        console.error('Erro ao enviar os dados para o servidor:', data.error);
      }
    })
    .catch((error) => {
      console.error('Erro ao enviar os dados para o servidor', error);
    }); 
  }
});