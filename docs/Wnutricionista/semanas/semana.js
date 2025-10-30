// ==========================================
// Variáveis Globais
// ==========================================
let semanaAtual = null;
let diaAtual = null;
let refeicaoEditando = null;

const diasSemana = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

// ==========================================
// Acesso aos Dados (localStorage)
// ==========================================
function getUsuarios() { return JSON.parse(localStorage.getItem('usuarios')) || []; }
function getPlanosAlimentares() { return JSON.parse(localStorage.getItem('planosAlimentares')) || []; }
function savePlanosAlimentares(planos) { localStorage.setItem('planosAlimentares', JSON.stringify(planos)); }
function getRefeicoes() { return JSON.parse(localStorage.getItem('refeicoes')) || []; }
function saveRefeicoes(refeicoes) { localStorage.setItem('refeicoes', JSON.stringify(refeicoes)); }
let usuarioId = null;       // será preenchido a partir da URL ou seleção
let planoAtualId = null;    // id do plano alimentar atual

// ==========================================
// Funções Principais
// ==========================================

function obterParametrosURL() {
    const params = new URLSearchParams(window.location.search);
    // Ler possíveis parâmetros que representam o usuário
    const paramUsuario = params.get('usuarioId') || params.get('cliente') || params.get('id');
    const parsedParam = paramUsuario !== null ? parseFloat(paramUsuario) : null;
    semanaAtual = parseInt(params.get('semana'));
    if (isNaN(semanaAtual)) semanaAtual = 1;

    let usuarios = getUsuarios();
    console.debug('[semana.js] paramUsuario=', paramUsuario, 'parsedParam=', parsedParam);
    console.debug('[semana.js] usuarios (count)=', usuarios ? usuarios.length : 0);
    // Se não existir lista de usuários, tentar obter usuário da sessão (localStorage 'usuario')
    if (!usuarios || usuarios.length === 0) {
        const sessaoUsuario = localStorage.getItem('usuario');
        if (sessaoUsuario) {
            try {
                const parsedSessao = JSON.parse(sessaoUsuario);
                usuarios = [parsedSessao];
            } catch (e) { /* ignorar */ }
        }
    }
    // Tentar encontrar o cliente pelo id (valor real armazenado em usuario.id)
    let cliente = null;
    if (parsedParam !== null && !isNaN(parsedParam)) {
        cliente = usuarios.find(u => u.id == parsedParam);
    }
    // Se não encontrado, tentar interpretar o parâmetro como índice na lista de usuários
    if (!cliente && parsedParam !== null && Number.isInteger(parsedParam)) {
        const idx = Number(parsedParam);
        // Tentar 0-based
        if (idx >= 0 && idx < usuarios.length) cliente = usuarios[idx];
        // Tentar 1-based
        if (!cliente && idx >= 1 && idx <= usuarios.length) cliente = usuarios[idx - 1];
    }

    // Se ainda não encontrou, não abortar silenciosamente — deixar a validação subir para o carregamento
    console.debug('[semana.js] cliente encontrado=', cliente);
    if (!cliente) {
        console.error("Cliente não encontrado com o ID/índice fornecido.");
        return;
    }
    
    let planos = getPlanosAlimentares();
    // Procura o plano usando o ID real do usuário.
    usuarioId = cliente.id;
    let plano = planos.find(p => p.cliente_id == usuarioId);
    
    if (!plano) {
        // Se não existir, cria um novo plano
        plano = {
            id: Date.now(),
            // <-- CORREÇÃO PRINCIPAL 3: Salva o ID real do usuário como a chave estrangeira (FK).
            cliente_id: usuarioId, 
            nome_plano: `Cardápio - ${cliente.nome}`,
            data_criacao: new Date().toISOString()
        };
        planos.push(plano);
        savePlanosAlimentares(planos);
    }
    
    planoAtualId = plano.id;
    console.debug('[semana.js] usuarioId=', usuarioId, 'planoAtualId=', planoAtualId, 'plano=', plano);
}

function getRefeicoesDia(semana, dia) {
    const todasRefeicoes = getRefeicoes();
    return todasRefeicoes.filter(r => 
        r.plano_id === planoAtualId && 
        r.semana == semana && 
        r.dia == dia
    ).sort((a, b) => a.horario.localeCompare(b.horario));
}

function salvarRefeicao(event) {
    // Se chamado por um evento de submit, prevenir comportamento padrão
    if (event && event.preventDefault) {
        event.preventDefault();
    }

    const form = document.getElementById('formRefeicao');
    if (!form) {
        console.error('[semana.js] salvarRefeicao: formulário não encontrado');
        return;
    }

    const tipo = document.getElementById('tipoRefeicao').value;
    const horario = document.getElementById('horario').value;
    const alimento = document.getElementById('alimento').value;
    const quantidade = document.getElementById('gramas').value;
    
    if (!horario || !alimento || !quantidade) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    const todasRefeicoes = getRefeicoes();
    
    if (refeicaoEditando !== null) {
        const index = todasRefeicoes.findIndex(r => r.id === refeicaoEditando);
        if (index !== -1) {
            todasRefeicoes[index] = { ...todasRefeicoes[index], tipo, horario, alimento, quantidade };
        }
    } else {
        todasRefeicoes.push({
            id: Date.now() + Math.random(),
            plano_id: planoAtualId,
            semana: semanaAtual,
            dia: diaAtual,
            tipo, horario, alimento, quantidade
        });
    }
    
    saveRefeicoes(todasRefeicoes);
    renderizarSemanas();
    fecharModal();
}

function excluirRefeicao(refeicaoId) {
    if (!confirm('Deseja realmente excluir esta refeição?')) return;
    
    const refeicoesAtualizadas = getRefeicoes().filter(r => r.id !== refeicaoId);
    saveRefeicoes(refeicoesAtualizadas);
    renderizarSemanas();
}

// ==========================================
// Renderização e UI (sem alterações lógicas)
// ==========================================

function renderizarDia(diaIndex) {
    const refeicoesDia = getRefeicoesDia(semanaAtual, diaIndex);
    const nomeDia = diasSemana[diaIndex - 1];
    
    const refeicoesHTML = refeicoesDia.length === 0 
        ? '<div class="mensagem-vazio">Nenhuma refeição cadastrada</div>'
        : refeicoesDia.map(renderizarRefeicao).join('');
    
    return `
        <div class="dia-column">
            <div class="dia-header"><h2 class="dia-titulo">${nomeDia}</h2></div>
            <div class="refeicoes-container">${refeicoesHTML}</div>
            <button class="btn-adicionar" onclick="abrirModal(${diaIndex})">+ Adicionar Refeição</button>
        </div>
    `;
}

function renderizarRefeicao(refeicao) {
    // Para simplificar, o conteúdo do SVG foi substituído. Cole o seu SVG aqui.
    return `
        <div class="refeicao-card" data-id="${refeicao.id}">
            <div class="refeicao-actions">
                <button class="btn-editar-refeicao" onclick="editarRefeicao(${refeicao.id})" title="Editar">&#9998;</button>
                <button class="btn-excluir-refeicao" onclick="excluirRefeicao(${refeicao.id})" title="Excluir">&#128465;</button>
            </div>
            <div class="refeicao-tipo">${refeicao.tipo}</div>
            <div class="refeicao-horario">⏰ ${refeicao.horario}</div>
            <div class="refeicao-info">
                <strong>Alimento:</strong> ${refeicao.alimento}<br>
                <strong>Quantidade:</strong> ${refeicao.quantidade}
            </div>
        </div>
    `;
}

function renderizarSemanas() {
    document.getElementById('tituloSemana').textContent = `Semana ${semanaAtual}`;
    const container = document.getElementById('semanasContainer');
    let html = '';
    for (let dia = 1; dia <= 7; dia++) {
        html += renderizarDia(dia);
    }
    container.innerHTML = html;
}

// ==========================================
// Lógica do Modal (sem alterações lógicas)
// ==========================================

function abrirModal(dia, refeicaoId = null) {
    console.debug('[semana.js] abrirModal: dia=', dia, 'refeicaoId=', refeicaoId);
    diaAtual = dia;
    refeicaoEditando = refeicaoId;
    
    const modal = document.getElementById('modalRefeicao');
    if (!modal) {
        console.error('[semana.js] abrirModal: modal #modalRefeicao não encontrado no DOM');
        return;
    }

    // Limpar form e campos
    const form = modal.querySelector('form');
    if (form) {
        console.debug('[semana.js] abrirModal: resetando formulário');
        form.reset();
    } else {
        console.error('[semana.js] abrirModal: form dentro do modal não encontrado');
        return;
    }

    // Verificar todos os campos necessários
    const campos = {
        modalTitulo: document.getElementById('modalTitulo'),
        tipoRefeicao: document.getElementById('tipoRefeicao'),
        horario: document.getElementById('horario'),
        alimento: document.getElementById('alimento'),
        gramas: document.getElementById('gramas')
    };

    // Verificar se todos os campos existem
    for (const [nome, elemento] of Object.entries(campos)) {
        if (!elemento) {
            console.error(`[semana.js] abrirModal: campo #${nome} não encontrado`);
            return;
        }
    }

    if (refeicaoId !== null) {
        campos.modalTitulo.textContent = 'Editar Refeição';
        const refeicao = getRefeicoes().find(r => r.id === refeicaoId);
        if (refeicao) {
            console.debug('[semana.js] abrirModal: preenchendo campos com refeição', refeicao);
            campos.tipoRefeicao.value = refeicao.tipo || '';
            campos.horario.value = refeicao.horario || '';
            campos.alimento.value = refeicao.alimento || '';
            campos.gramas.value = refeicao.quantidade || '';
        } else {
            console.warn('[semana.js] abrirModal: refeição não encontrada com id', refeicaoId);
        }
    } else {
        campos.modalTitulo.textContent = 'Adicionar Refeição';
    }

    // Garantir que o modal está visível
    modal.style.display = 'block';
    modal.classList.add('active');
}

function fecharModal() {
    const modal = document.getElementById('modalRefeicao');
    if (!modal) {
        console.error('[semana.js] fecharModal: modal não encontrado');
        return;
    }

    // Limpar dados do formulário
    const form = modal.querySelector('form');
    if (form) form.reset();

    // Limpar variáveis globais
    refeicaoEditando = null;
    diaAtual = null;

    // Esconder modal
    modal.classList.remove('active');
    modal.style.display = 'none';
    
    console.debug('[semana.js] fecharModal: modal fechado e dados limpos');
}

function editarRefeicao(refeicaoId) {
    console.debug('[semana.js] editarRefeicao: id=', refeicaoId);
    const refeicao = getRefeicoes().find(r => r.id === refeicaoId);
    if (refeicao) {
        abrirModal(refeicao.dia, refeicaoId);
    } else {
        console.error('[semana.js] editarRefeicao: refeição não encontrada com id', refeicaoId);
    }
}

// ==========================================
// Event Listeners e Inicialização
// ==========================================

function voltarParaDetalhes() {
    window.history.back();
}

document.addEventListener('DOMContentLoaded', () => {
    obterParametrosURL();
    
    if (!usuarioId || !semanaAtual) {
        alert('Erro: Cliente ou semana não especificados na URL!');
        window.history.back();
        return;
    }
    
    renderizarSemanas();
    
    // Inicialização do modal
    const modal = document.getElementById('modalRefeicao');
    if (modal) {
        // Fechar no clique fora
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'modalRefeicao') {
                fecharModal();
            }
        });

        // Fechar no ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                fecharModal();
            }
        });

        // Garantir que o modal começa fechado
        modal.style.display = 'none';
        modal.classList.remove('active');
    } else {
        console.error('[semana.js] modalRefeicao não encontrado no DOM; eventos de modal serão ignorados');
    }

    // Inicialização do formulário
    const formRefeicao = document.getElementById('formRefeicao');
    if (formRefeicao) {
        formRefeicao.addEventListener('submit', (e) => {
            e.preventDefault();
            console.debug('[semana.js] formRefeicao submit');
            salvarRefeicao();
        });

        // Adicionar botão de cancelar se existir
        const btnCancelar = formRefeicao.querySelector('button[type="button"]');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', fecharModal);
        }
    } else {
        console.error('[semana.js] formRefeicao não encontrado no DOM; envio de refeições não estará disponível');
    }
});