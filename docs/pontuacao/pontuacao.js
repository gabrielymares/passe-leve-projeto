// ===== FUNÇÕES DE VALIDAÇÃO E TRATAMENTO DE ERRO =====

/**
 * Exibe uma mensagem de erro padronizada na tela.
 * @param {string} mensagem - A mensagem de erro a ser exibida.
 */
function mostrarErro(mensagem) {
    const container = document.getElementById('resultado-box');
    container.className = 'resultado-box erro'; // Aplica a classe de erro

    document.getElementById("resultado-pontos").textContent = " Erro ao carregar dados";
    document.getElementById("resultado-texto").textContent = mensagem;
    document.getElementById("detalhes-extras").innerHTML = `
        <p><strong>O que fazer:</strong></p>
        <ol>
            <li>Verifique se sua sessão não expirou.</li>
            <li>Tente refazer a avaliação a partir da página anterior.</li>
            <li>Se o problema persistir, tente fazer o login novamente.</li>
        </ol>
    `;

    const btnProsseguir = document.getElementById("btn-prosseguir");
    if (btnProsseguir) {
        btnProsseguir.style.display = 'none'; // Esconde o botão em caso de erro
    }
    document.getElementById("acoes-container").style.display = 'block';
}

/**
 * Valida se o objeto de avaliação contém os campos essenciais.
 * @param {object} dadosAvaliacao - O objeto de avaliação a ser validado.
 * @returns {string[]} - Um array com as mensagens de erro. Vazio se não houver erros.
 */
function validarDados(dadosAvaliacao) {
    const erros = [];
    if (typeof dadosAvaliacao.pontuacao !== 'number' || isNaN(dadosAvaliacao.pontuacao)) {
        erros.push('Pontuação inválida');
    }
    if (!dadosAvaliacao.grupo || dadosAvaliacao.grupo.trim() === '') {
        erros.push('Grupo não identificado');
    }
    if (!Array.isArray(dadosAvaliacao.p2_alergia)) {
        erros.push('Dados de alergias corrompidos');
    }
    return erros;
}

// ===== CARREGAMENTO PRINCIPAL =====

document.addEventListener('DOMContentLoaded', () => {
    // Simula um pequeno delay de loading para melhorar a experiência do usuário (UX)
    setTimeout(() => {
        carregarResultados();
    }, 500);

    // --- LÓGICA DO BOTÃO "PROSSEGUIR" (SIMPLIFICADA) ---
    const botaoProsseguir = document.getElementById('btn-prosseguir');
    if (botaoProsseguir) {
        botaoProsseguir.addEventListener('click', () => {
            // A lógica de salvar foi removida daqui, pois os dados já estão
            // permanentemente salvos no objeto do usuário.
            // A única responsabilidade do botão agora é redirecionar.
            window.location.href = "../paginainicial/paginainicial.html";
        });
    }
});

/**
 * Função principal que carrega os dados da sessão e os exibe na tela.
 */
function carregarResultados() {
    try {
        // MUDANÇA PRINCIPAL: Buscar dados do usuário logado, não mais do sessionStorage.
        const usuarioJSON = localStorage.getItem('usuario');
        if (!usuarioJSON) {
            throw new Error('Sessão não encontrada. Por favor, faça o login novamente.');
        }

        const usuario = JSON.parse(usuarioJSON);

        // O objeto de dados agora é a propriedade 'avaliacao' dentro do usuário.
        const dadosAvaliacao = usuario.avaliacao;
        if (!dadosAvaliacao) {
            throw new Error('Nenhum dado de avaliação encontrado no seu perfil. Por favor, refaça o questionário.');
        }

        const erros = validarDados(dadosAvaliacao);
        if (erros.length > 0) {
            // Mesmo com erros, tenta exibir o que foi possível coletar.
            exibirResultado(dadosAvaliacao, true); // O 'true' ativa o modo de alerta.
            return;
        }

        // Exibe o resultado com sucesso.
        exibirResultado(dadosAvaliacao, false);

    } catch (error) {
        console.error('Erro ao carregar resultados:', error);
        mostrarErro(error.message);
    }
}

/**
 * Preenche a página com os resultados da avaliação.
 * @param {object} dados - O objeto com os dados da avaliação.
 * @param {boolean} [isWarning=false] - Se true, exibe em modo de alerta.
 */
function exibirResultado(dados, isWarning = false) {
    const container = document.getElementById('resultado-box');
    container.className = isWarning ? 'resultado-box erro' : 'resultado-box sucesso';

    // Preenche a pontuação e o grupo
    document.getElementById("resultado-pontos").textContent = isWarning ? "Dados Inconsistentes" : `${dados.grupo}`;
    document.getElementById("resultado-texto").innerHTML = isWarning 
        ? `Seus dados foram salvos, mas houve inconsistências. Pontuação calculada: <strong>${dados.pontuacao}</strong>.`
        : `Com base nas suas respostas, você foi classificado no <strong>${dados.grupo}</strong>!`;

    // Monta os detalhes extras
    let detalhesHTML = '';
    
    // Alergias
    const alergias = dados.p2_alergia || [];
    if (alergias.length > 0) {
        detalhesHTML += `<p><strong>Alergias/Intolerâncias:</strong> ${alergias.join(', ')}</p>`;
    }
    if (dados.p2_alergia_outros) {
        detalhesHTML += `<p><strong>Outras Alergias:</strong> ${dados.p2_alergia_outros}</p>`;
    }

    // Restrições e Doenças
    if (dados.p3_restricao === 'sim' && dados.p3_restricao_outros) {
        detalhesHTML += `<p><strong>Restrição Médica:</strong> ${dados.p3_restricao_outros}</p>`;
    }
    if (dados.p1_doenca === 'sim' && dados.p1_doenca_outros) {
        detalhesHTML += `<p><strong>Doença(s) Diagnosticada(s):</strong> ${dados.p1_doenca_outros}</p>`;
    }

    // Objetivos
    const objetivos = (dados.p6_objetivo || []).map(o => o.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    if (objetivos.length > 0) {
        detalhesHTML += `<p><strong>Seus Objetivos:</strong> ${objetivos.join(', ')}</p>`;
    }
    
    detalhesHTML += `<hr style="margin: 15px 0;">`;
    detalhesHTML += `<p><strong>Alimentos que evita:</strong> ${dados.p8_alimentos_evita || 'Não especificado'}</p>`;
    detalhesHTML += `<p><strong>Alimentos/Bebidas frequentes:</strong> ${dados.p9_frequencia || 'Não especificado'}</p>`;
    
    if (dados.timestamp) {
        const dataAvaliacao = new Date(dados.timestamp).toLocaleString('pt-BR');
        detalhesHTML += `<p style="color: #666; font-size: 12px; margin-top: 20px;">Avaliação realizada em: ${dataAvaliacao}</p>`;
    }

    document.getElementById("detalhes-extras").innerHTML = detalhesHTML;
    document.getElementById("acoes-container").style.display = 'block';
}

// Listener global para capturar erros inesperados na página
window.addEventListener('error', (e) => {
    console.error('Erro inesperado na página:', e.error);
    mostrarErro('Ocorreu um erro inesperado. Tente recarregar a página.');
});