// =========================================================================
// FUNÇÕES DE MANIPULAÇÃO DE DADOS (CORRIGIDAS)
// =========================================================================

/**
 * Recupera TODOS os usuários do localStorage e filtra APENAS os pacientes.
 * @returns {Array} - Um array contendo apenas os objetos de usuário que são pacientes.
 */
function getPacientes() {
    // 1. Busca o array principal 'usuarios'
    const usuariosJSON = localStorage.getItem('usuarios');
    if (!usuariosJSON) {
        return []; // Retorna array vazio se não houver usuários cadastrados
    }
    
    // 2. Converte o JSON para um array de objetos
    const todosUsuarios = JSON.parse(usuariosJSON);
    
    // 3. Filtra e retorna apenas os usuários com tipo 'paciente'
    return todosUsuarios.filter(user => user.tipo === 'paciente');
}

/**
 * Monta uma string formatada com as restrições do paciente a partir do objeto de avaliação.
 * @param {object} avaliacao - O objeto 'avaliacao' do paciente.
 * @returns {string} - Um texto formatado com todas as restrições.
 */
function montarRestricoes(avaliacao = {}) { // Adicionado fallback para evitar erros
    const restricoes = [];
    
    if (avaliacao.p1_doenca === 'sim' && avaliacao.p1_doenca_outros) {
        restricoes.push(`Doença: ${avaliacao.p1_doenca_outros}`);
    }
    
    const alergias = avaliacao.p2_alergia || [];
    if (alergias.length > 0) {
        restricoes.push(`Alergias: ${alergias.join(', ')}`);
    }
    
    if (avaliacao.p2_alergia_outros) {
        restricoes.push(`Outras alergias: ${avaliacao.p2_alergia_outros}`);
    }
    
    if (avaliacao.p3_restricao === 'sim' && avaliacao.p3_restricao_outros) {
        restricoes.push(`Restrição médica: ${avaliacao.p3_restricao_outros}`);
    }
    
    if (avaliacao.p8_alimentos_evita) {
        restricoes.push(`Evita: ${avaliacao.p8_alimentos_evita}`);
    }
    
    return restricoes.length > 0 ? restricoes.join('\n') : 'Nenhuma restrição informada';
}

/**
 * Monta uma string formatada com as informações de saúde do paciente.
 * @param {object} avaliacao - O objeto 'avaliacao' do paciente.
 * @returns {string} - Um texto formatado com os dados de saúde.
 */
function montarSaude(avaliacao = {}) { // Adicionado fallback para evitar erros
    const saude = [];
    
    if (avaliacao.p4_exercicio) saude.push(`Exercício: ${avaliacao.p4_exercicio.replace('_', ' ')}`);
    if (avaliacao.p5_apetite) saude.push(`Apetite: ${avaliacao.p5_apetite}`);
    
    const objetivos = (avaliacao.p6_objetivo || []).map(o => o.replace(/_/g, ' '));
    if (objetivos.length > 0) saude.push(`Objetivos: ${objetivos.join(', ')}`);
    
    if (avaliacao.p9_frequencia) saude.push(`Consumo frequente: ${avaliacao.p9_frequencia}`);
    if (avaliacao.p10_emocional) saude.push(`Fome emocional: ${avaliacao.p10_emocional.replace('_', ' ')}`);
    if (avaliacao.grupo) saude.push(`\nGrupo: ${avaliacao.grupo}`);
    if (avaliacao.pontuacao !== undefined) saude.push(`Pontuação: ${avaliacao.pontuacao}/50`);
    
    return saude.length > 0 ? saude.join('\n') : 'Informações não disponíveis';
}

// =========================================================================
// FUNÇÕES DE RENDERIZAÇÃO E UI (CORRIGIDAS)
// =========================================================================

/**
 * Exibe a lista de todos os pacientes na tela.
 */
function renderPacientes() {
    const pacientes = getPacientes();
    const clientsList = document.getElementById('clientsList');
    
    if (!clientsList) return;
    clientsList.innerHTML = '';

    if (pacientes.length === 0) {
        clientsList.innerHTML = '<p class="lista-vazia">Nenhum paciente cadastrado ainda.</p>';
        return;
    }

    pacientes.forEach((paciente) => {
        const card = document.createElement('div');
        card.className = 'client-card';
        // Usar o ID do paciente ao invés do índice
        card.onclick = () => mostrarDetalhes(paciente.id);
        
        card.innerHTML = `
            <span class="client-name">${paciente.nome || 'Nome não informado'}</span>
            <svg class="edit-icon" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        `;
        clientsList.appendChild(card);
    });
}

/**
 * Exibe os detalhes de um paciente específico.
 * @param {number|string} userId - O ID do paciente
 */
function mostrarDetalhes(userId) {
    const pacientes = getPacientes();
    const paciente = pacientes.find(p => p.id == userId);

    if (!paciente) return;

    // CORREÇÃO: Acessar os dados de perfil e avaliação aninhados
    const perfil = paciente.perfil || {};
    const avaliacao = paciente.avaliacao || {};

    // Guardar o ID do cliente ao invés do índice
    localStorage.setItem('clienteAtualIndex', userId);

    // Dados do objeto principal e do 'perfil'
    document.getElementById('detailNome').textContent = paciente.nome || 'Nome não informado';
    document.getElementById('detailGenero').textContent = `Gênero ${perfil.sexo || 'Não informado'}`;
    document.getElementById('detailAltura').textContent = `${perfil.altura || '0'}m de altura`;
    document.getElementById('detailIdade').textContent = `${perfil.idade || '0'} anos`;
    document.getElementById('detailPeso').textContent = `${perfil.peso || '0'} kg`;
    document.getElementById('detailTelefone').textContent = paciente.contatoAcesso || 'Não informado';
    
    // Formatar IMC a partir do perfil
    const imcFormatado = perfil.imc ? Number(perfil.imc).toFixed(2).replace('.', ',') : 'Não calculado';
    document.getElementById('detailIMC').textContent = `IMC ${imcFormatado}`;
    
    // Gerar e exibir restrições e saúde a partir da 'avaliacao'
    const restricoesElement = document.getElementById('detailRestricoes');
    restricoesElement.style.whiteSpace = 'pre-line';
    restricoesElement.textContent = montarRestricoes(avaliacao);
    
    const saudeElement = document.getElementById('detailSaude');
    saudeElement.style.whiteSpace = 'pre-line';
    saudeElement.textContent = montarSaude(avaliacao);

    // Lógica de UI para trocar de tela
    document.getElementById('clientListScreen').style.display = 'none';
    document.getElementById('clientDetailsScreen').style.display = 'block';
    
    // Passar o ID do usuário ao invés do índice
    adicionarEventosSemanais(paciente.id);
}

// Adicionar eventos de clique nos cards de semana usando o ID real do usuário
function adicionarEventosSemanais(userId) {
    document.querySelectorAll('.week-card').forEach((card, index) => {
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        newCard.addEventListener('click', () => {
            window.location.href = `./semanas/semana.html?semana=${index + 1}&cliente=${userId}`;
        });
    });
}

// Voltar para a lista (sem alterações)
function voltarParaLista() {
    document.getElementById('clientListScreen').style.display = 'block';
    document.getElementById('clientDetailsScreen').style.display = 'none';
}

// Inicializar a página quando carregar
document.addEventListener('DOMContentLoaded', () => {
    renderPacientes();
});