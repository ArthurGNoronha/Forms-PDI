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

valorPesquisa.addEventListener('focus', function() {
  angle += 180;
  dropdown.style.display = 'block';
  dropdownIcon.style.transform = `rotate(${angle}deg)`;
});

valorPesquisa.addEventListener('blur', function() {
  angle += 180;
  setTimeout(() => {
    dropdown.style.display = 'none';
    dropdownIcon.style.transform = `rotate(${angle}deg)`;
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
    valorPesquisa.value = '';
    opcaoSelecionada = option.innerText;
    valorPesquisa.value = opcaoSelecionada;
    dropdown.style.display = 'none';

    mensagemErroReag.textContent = "";
    mensagemErroReag.style.display = 'none';
  });
});

//Opcao outros label aparecer

document.getElementById("outros").addEventListener("change", function () {
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
outrasOpcoes.forEach(function(opcao) {
  opcao.addEventListener('change', function() {
    var outrosTexto = document.getElementById("outros-texto");
    if (!document.getElementById("outros").checked) {
      outrosTexto.hidden = true;
      outrosTexto.value = "";
      mensagemErroOutros.textContent = "";
      mensagemErroOutros.style.display = 'none';
    }
  });
});

//Validar Numero Medida

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
  
//Validar Pesquisa
  
dropdown.addEventListener("change",validarReag)
valorPesquisa.addEventListener("blur", validarReag); 
  
function validarReag() {
  var valorReag = valorPesquisa.value;
  
  mensagemErroReag.textContent = "";
  mensagemErroReag.style.display = 'none';
  
  if (valorReag === '') {
    mensagemErroReag.textContent = MENSAGEM_ERRO_GERAL;
    mensagemErroReag.style.display = 'block'
    valorPesquisa.value = "";
  }
}

//Validar Responsável

respInput.addEventListener("blur", validarResp);

function validarResp(){
  var nomeResp = respInput.value.trimStart();

  mensagemErroResp.textContent = "";
  mensagemErroResp.style.display = 'none';

  if (nomeResp === '' ){
    mensagemErroResp.textContent = MENSAGEM_ERRO_GERAL;
    mensagemErroResp.style.display = 'block'
  } 
}

//Validar Outros

valorOutros.addEventListener("blur", validarOutros);

function validarOutros() {
  const outrosInput = valorOutros.value.trimStart();
  
  mensagemErroOutros.textContent = "";
  mensagemErroOutros.style.display = 'none';

  if (outrosCheckbox.checked && outrosInput === "") {
    setTimeout(function () {
      mensagemErroOutros.textContent = MENSAGEM_ERRO_GERAL;
      mensagemErroOutros.style.display = 'block'
      valorOutros.value = "";
    }, 62);
  }
}

outrosCheckbox.addEventListener("change", function () {
  mensagemErroOutros.textContent = "";
  mensagemErroOutros.style.display = 'none'
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
  const opcoesValidas = Array.from(options).map(option => option.innerText.toUpperCase().trim());

  if (valorResp === "" || valorQtd === "" || medida === null || valorReagente === "") {
      alert(`Por favor, preencha todos os campos obrigatórios antes de enviar!`);
  } else if (outrosCheckbox.checked && outrosValor === '') {
      alert('A opção "Outros" é obrigatória!');
  } else if(!opcoesValidas.includes(valorReagente.toUpperCase())) {
    mensagemErroReag.textContent = 'Por favor, selecione uma opção válida';
    mensagemErroReag.style.display = 'block';
    reagente.value = '';
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
        valReag: valorReagente
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
          window.location.href = data.redirectUrl;
        } else {
          console.error('Erro ao enviar os dados para o servidor:', data.error);
    
          // Exibir mensagem de erro ao usuário
          if (data.error === 'Opção inválida selecionada') {
            alert('Opção inválida selecionada. Por favor, escolha uma opção válida.');
            valorReagente = '';
            mensagemErroReag.textContent = 'Por favor, selecione uma opção válida!';
            mensagemErroReag.style.display = 'block';
            this.disabled = false;
          } else {
            alert('Erro ao enviar os dados para o servidor. Por favor, tente novamente mais tarde.');
          }
        }
      })
      .catch((error) => {
        console.error('Erro ao enviar os dados para o servidor', error);
    
        // Exibir mensagem de erro ao usuário
        alert('Erro ao enviar os dados para o servidor. Por favor, tente novamente mais tarde.');
      });    
  }
});