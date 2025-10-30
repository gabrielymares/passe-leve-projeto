// ==== Elementos de UI Comuns ====
const btnCadastro = document.getElementById("btnCadastro");
const btnLogin = document.getElementById("btnLogin");
const formCadastro = document.getElementById("formCadastro");
const formLogin = document.getElementById("formLogin");

// Elementos de Seleção de Tipo
const userTypeTabs = document.querySelectorAll(".type-tab");
const cadastroNutricionista = document.getElementById("cadastroNutricionista");
const cadastroPaciente = document.getElementById("cadastroPaciente");

// ==== Elementos do Nutricionista ====
const nutriFase1 = document.getElementById("nutriFase1");
const nutriFase2 = document.getElementById("nutriFase2");
const btnNutriProximaFase = document.getElementById("btnNutriProximaFase");
const btnNutriFinalizarCadastro = document.getElementById("btnNutriFinalizarCadastro");
const btnVoltarFase = document.getElementById("btnVoltarFase");
const nutriCadastroInput = document.getElementById("nutriCadastroInput");
const nutriSenhaCadastroInput = document.getElementById("nutriSenhaCadastroInput");
const nutriConfirmarSenhaInput = document.getElementById("nutriConfirmarSenhaInput");
const nomeNutriInput = document.getElementById("nomeNutriInput");
const crnNutriInput = document.getElementById("crnNutriInput");
const contatoNutriInput = document.getElementById("contatoNutriInput");

// ==== Elementos do Paciente ====
const btnPacienteFinalizarCadastro = document.getElementById("btnPacienteFinalizarCadastro");
const pacienteNomeInput = document.getElementById("pacienteNomeInput");
const pacienteCadastroInput = document.getElementById("pacienteCadastroInput");
const pacienteSenhaCadastroInput = document.getElementById("pacienteSenhaCadastroInput");
const pacienteConfirmarSenhaInput = document.getElementById("pacienteConfirmarSenhaInput");

// ==== Elementos de Login ====
const btnEnviarLogin = document.getElementById("btnEnviarLogin");
const loginInput = document.getElementById("loginInput");
const senhaLoginInput = document.getElementById("senhaLoginInput"); 

// ==== Variáveis de Controle e Chave de Armazenamento ====
let userTypeAtual = 'nutricionista';
let dadosCadastroTemp = {};
const USERS_STORAGE_KEY = 'usuarios'; // Chave única para armazenar todos os usuários


// ==== Funções de Máscara ====

function maskPhoneBR(digits) {
    const d = digits.replace(/\D/g, "").slice(0, 11);
    if (d.length === 0) return '';
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function applyContatoMask(e) {
    let val = e.target.value || "";
    val = val.trim();

    if (val.includes("@") || !/^[\d()\s\-]*$/.test(val)) {
        e.target.setAttribute("inputmode", "email");
        e.target.maxLength = 254;
        e.target.value = val;
        return;
    }

    const digits = val.replace(/\D/g, "");
    if (digits.length > 0 || val.includes("(")) {
        e.target.setAttribute("inputmode", "tel");
        e.target.maxLength = 16;
        e.target.value = maskPhoneBR(digits);
        return;
    }
}

function addMaskListeners(inputElement) {
    if (inputElement) {
        inputElement.addEventListener("input", applyContatoMask);
        inputElement.addEventListener("blur", applyContatoMask);
        inputElement.addEventListener("paste", () => setTimeout(applyContatoMask, 0));
    }
}

// Aplica a máscara a todos os campos de contato/login
addMaskListeners(nutriCadastroInput);
addMaskListeners(contatoNutriInput);
addMaskListeners(pacienteCadastroInput);
addMaskListeners(loginInput);


// ==== Funções de Controle de UI ====

function showTab(tab) {
    if (tab === "cadastro") {
        btnCadastro.classList.add("active");
        btnLogin.classList.remove("active");
        formCadastro.classList.add("active");
        formLogin.classList.remove("active");
        
        showNutriFase(1); 
        showUserTypeForm(userTypeAtual);
    } else {
        btnLogin.classList.add("active");
        btnCadastro.classList.remove("active");
        formLogin.classList.add("active");
        formCadastro.classList.remove("active");
    }
}

function showNutriFase(faseNumber) {
    if (faseNumber === 1) {
        nutriFase1.classList.add("active");
        nutriFase2.classList.remove("active");
    } else {
        nutriFase2.classList.add("active");
        nutriFase1.classList.remove("active");
        
        if (!contatoNutriInput.value) {
            contatoNutriInput.value = nutriCadastroInput.value;
            applyContatoMask({target: contatoNutriInput});
        }
    }
}

function showUserTypeForm(type) {
    userTypeAtual = type;
    
    userTypeTabs.forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-type') === type);
    });

    if (type === 'nutricionista') {
        cadastroNutricionista.classList.add('active');
        cadastroPaciente.classList.remove('active');
        showNutriFase(1);
    } else {
        cadastroPaciente.classList.add('active');
        cadastroNutricionista.classList.remove('active');
    }
}


// ==== Eventos de Clique ====

btnCadastro.addEventListener("click", () => showTab("cadastro"));
btnLogin.addEventListener("click", () => showTab("login"));

userTypeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        showUserTypeForm(tab.getAttribute('data-type'));
    });
});


// =========================================================================
// LÓGICA DE CADASTRO REATORADA
// =========================================================================

// ==== Lógica de Cadastro do NUTRICIONISTA (2 Fases) ====

btnNutriProximaFase.addEventListener("click", (e) => {
    e.preventDefault();
    
    if (!nutriCadastroInput.value.trim() || !nutriSenhaCadastroInput.value.trim() || !nutriConfirmarSenhaInput.value.trim()) {
        alert("Preencha todos os campos de acesso.");
        return;
    }
    if (nutriSenhaCadastroInput.value.length < 6) {
        alert("A senha deve ter no mínimo 6 caracteres.");
        return;
    }
    if (nutriSenhaCadastroInput.value !== nutriConfirmarSenhaInput.value) {
        alert("As senhas não coincidem.");
        return;
    }
    dadosCadastroTemp = {
        contatoAcesso: nutriCadastroInput.value.trim(),
        senha: nutriSenhaCadastroInput.value
    };
    showNutriFase(2);
});

btnNutriFinalizarCadastro.addEventListener("click", (e) => {
    e.preventDefault();
    
    if (!nomeNutriInput.value.trim() || !crnNutriInput.value.trim() || !contatoNutriInput.value.trim()) {
        alert("Preencha todos os dados profissionais.");
        return;
    }
    
    const dadosNutricionistaCompleto = {
        id: Date.now() + Math.random(),
        tipo: 'nutricionista',
        ...dadosCadastroTemp,
        nome: nomeNutriInput.value.trim(),
        crn: crnNutriInput.value.trim(),
        contatoProfissional: contatoNutriInput.value.trim(),
        dataCadastro: new Date().toISOString()
    };

    const usuarios = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];

    const usuarioExistente = usuarios.find(user => user.contatoAcesso === dadosNutricionistaCompleto.contatoAcesso);
    if (usuarioExistente) {
        alert("Este email/telefone já está cadastrado!");
        return;
    }

    usuarios.push(dadosNutricionistaCompleto);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usuarios));
    
    alert(`Cadastro da(o) ${dadosNutricionistaCompleto.nome} (Nutricionista) finalizado com sucesso!`);
    
    dadosCadastroTemp = {}; 
    showTab("login");
    formCadastro.reset(); // Limpa todos os campos do formulário
});

btnVoltarFase.addEventListener("click", () => showNutriFase(1));


// ==== Lógica de Cadastro do PACIENTE (1 Fase) ====

btnPacienteFinalizarCadastro.addEventListener("click", (e) => {
    e.preventDefault();

    if (!pacienteNomeInput.value.trim() || !pacienteCadastroInput.value.trim() || 
        !pacienteSenhaCadastroInput.value.trim() || !pacienteConfirmarSenhaInput.value.trim()) {
        alert("Preencha todos os campos do paciente.");
        return;
    }
    if (pacienteSenhaCadastroInput.value.length < 6) {
        alert("A senha deve ter no mínimo 6 caracteres.");
        return;
    }
    if (pacienteSenhaCadastroInput.value !== pacienteConfirmarSenhaInput.value) {
        alert("As senhas não coincidem.");
        return;
    }

    const dadosPaciente = {
        id: Date.now() + Math.random(),
        tipo: 'paciente',
        nome: pacienteNomeInput.value.trim(),
        contatoAcesso: pacienteCadastroInput.value.trim(),
        senha: pacienteSenhaCadastroInput.value,
        dataCadastro: new Date().toISOString()
    };

    const usuarios = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];

    const usuarioExistente = usuarios.find(user => user.contatoAcesso === dadosPaciente.contatoAcesso);
    if (usuarioExistente) {
        alert("Este email/telefone já está cadastrado!");
        return;
    }
    
    usuarios.push(dadosPaciente);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usuarios));

    alert(`Cadastro de ${dadosPaciente.nome} (Paciente) finalizado com sucesso!`);

    showTab("login");
    formCadastro.reset(); // Limpa todos os campos do formulário
});


// =========================================================================
// LÓGICA DE LOGIN REATORADA
// =========================================================================

btnEnviarLogin.addEventListener("click", (e) => {
    e.preventDefault();

    if (!loginInput.value.trim() || !senhaLoginInput.value.trim()) {
        alert("Preencha o Email/Telefone e a Senha.");
        return;
    }

    const contatoDigitado = loginInput.value.trim();
    const senhaDigitada = senhaLoginInput.value;
    
    const usuarios = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];

    const dadosCadastrados = usuarios.find(user => user.contatoAcesso === contatoDigitado);

    if (!dadosCadastrados) {
        alert("Credenciais inválidas. Usuário não encontrado.");
        return;
    }

    if (dadosCadastrados.senha !== senhaDigitada) {
        alert("Credenciais inválidas. Senha incorreta.");
        return;
    }
    
    // Salva o usuário encontrado como a sessão ativa
    localStorage.setItem('usuario', JSON.stringify(dadosCadastrados));
    
    // Redireciona com base no tipo
    if (dadosCadastrados.tipo === 'nutricionista') {
        window.location.href = "../Wnutricionista/telainicial.html";
    } else {
        window.location.href = "../formulario/formulario.html";
    }
});


// ==== Inicialização da Página ====
document.addEventListener('DOMContentLoaded', () => {
    userTypeAtual = 'nutricionista'; 
    showTab("cadastro"); 
    showUserTypeForm(userTypeAtual);
});