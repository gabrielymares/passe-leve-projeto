// ==== Funções de utilitário ====
function normalizeLogin(value) {
    const v = String(value || '').trim();
    if (!v) return '';
    if (v.includes('@')) return v.toLowerCase();
    return v.replace(/\D/g, '');
}

function maskPhoneBR(digits) {
    const d = digits.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

document.addEventListener('DOMContentLoaded', () => {
    // Nota: O script 'verificarSessao.js' já terá rodado e garantido
    // que o usuário DEVE estar nesta página.

    const form = document.getElementById('dataForm');
    const alturaInput = document.getElementById('altura');
    const pesoInput = document.getElementById('peso');
    const resultadoImcInput = document.getElementById('resultado-imc-input');
    const contatoInput = document.getElementById('contato');

    // ==========================================================
    // TRECHO DA MÁSCARA QUE FOI RESTAURADO
    // ==========================================================
    function applyContatoMask() {
        let val = contatoInput.value || '';
        val = val.trim();

        if (val.includes('@')) {
            contatoInput.setAttribute('inputmode', 'email');
            contatoInput.maxLength = 254;
            contatoInput.value = val;
            return;
        }

        const digits = val.replace(/\D/g, '');
        contatoInput.setAttribute('inputmode', 'tel');
        contatoInput.maxLength = 16;
        contatoInput.value = maskPhoneBR(digits);
    }

    if (contatoInput) {
        contatoInput.addEventListener('input', applyContatoMask);
        contatoInput.addEventListener('blur', applyContatoMask);
        contatoInput.addEventListener('paste', () => setTimeout(applyContatoMask, 0));
    }
    // ==========================================================
    // FIM DO TRECHO RESTAURADO
    // ==========================================================

    const calcularEExibirIMC = () => {
        const altura = parseFloat(alturaInput.value);
        const pesoKg = parseFloat(pesoInput.value);

        if (altura > 0 && pesoKg > 0) {
            const imc = pesoKg / (altura * altura);
            resultadoImcInput.dataset.imc = imc.toFixed(2);
            resultadoImcInput.value = `Seu IMC é: ${imc.toFixed(2)}`;
        } else {
            resultadoImcInput.value = '';
            resultadoImcInput.dataset.imc = '';
        }
    };

    alturaInput.addEventListener('input', calcularEExibirIMC);
    pesoInput.addEventListener('input', calcularEExibirIMC);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Coleta e validação dos dados
        const nome = document.getElementById('nome').value.trim();
        const idade = parseInt(document.getElementById('idade').value);
        const sexo = document.getElementById('sexo').value;
        const altura = parseFloat(alturaInput.value);
        const pesoKg = parseFloat(document.getElementById('peso').value);
        const contato = contatoInput.value;
        const imc = resultadoImcInput.dataset.imc ? parseFloat(resultadoImcInput.dataset.imc) : null;

        if (altura > 3.99) {
            alert('A altura máxima permitida é de 3.99 metros.');
            return;
        }

        if (!nome || !idade || !sexo || !altura || !pesoKg || !contato || !imc) {
            alert('Por favor, preencha todos os campos e calcule seu IMC.');
            return;
        }

        // 2. Cria o objeto de dados do perfil
        const dadosPerfil = {
            nome: nome,
            idade: idade,
            sexo: sexo,
            altura: altura,
            peso: pesoKg,
            contato: normalizeLogin(contato),
            imc: imc,
            dataInicio: new Date().toISOString()
        };
        
        // 3. NOVA LÓGICA DE SALVAMENTO
        try {
            const usuarioSessao = JSON.parse(localStorage.getItem('usuario'));
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

            if (!usuarioSessao) {
                throw new Error("Sessão não encontrada. Faça o login novamente.");
            }

            let usuarioAtualizado = null;

            const usuariosAtualizados = usuarios.map(user => {
                if (user.contatoAcesso === usuarioSessao.contatoAcesso) {
                    usuarioAtualizado = { ...user, perfil: dadosPerfil };
                    return usuarioAtualizado;
                }
                return user;
            });
            
            if (!usuarioAtualizado) {
                 throw new Error("Usuário não encontrado na base de dados.");
            }

            localStorage.setItem('usuarios', JSON.stringify(usuariosAtualizados));
            localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));

            // 4. Redireciona para a próxima etapa (avaliação)
            window.location.href = "../avaliacao/avaliacao.html";

        } catch (error) {
            console.error("Falha ao salvar o perfil do usuário:", error);
            alert("Ocorreu um erro ao salvar seus dados. Por favor, tente novamente.");
        }
    });
});