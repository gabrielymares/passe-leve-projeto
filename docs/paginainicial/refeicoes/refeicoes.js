// refeicoes.js (refeicoes/refeicoes.html) - VERSÃO CORRIGIDA

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const semanaNumero = params.get('semana');

    const tituloEl = document.getElementById('titulo-semana');
    const containerEl = document.getElementById('container-dias');

    // --- Validação Inicial ---
    if (!semanaNumero) {
        tituloEl.textContent = "Erro";
        containerEl.innerHTML = '<p class="mensagem-vazio">Número da semana não especificado.</p>';
        return;
    }
    tituloEl.textContent = `Semana ${semanaNumero}`;

    // --- CORREÇÃO: Buscar usuário logado corretamente ---
    let usuarioLogado = null;
    
    // Tenta primeiro buscar do localStorage 'usuario' (sessão individual)
    const usuarioJSON = localStorage.getItem('usuario');
    if (usuarioJSON) {
        try {
            usuarioLogado = JSON.parse(usuarioJSON);
            console.log('[refeicoes.js] Usuário encontrado em localStorage.usuario:', usuarioLogado);
        } catch (e) {
            console.error('[refeicoes.js] Erro ao parsear usuario:', e);
        }
    }
    
    // Se não encontrou, tenta buscar na lista de usuários
    if (!usuarioLogado) {
        const usuariosJSON = localStorage.getItem('usuarios');
        if (usuariosJSON) {
            try {
                const usuarios = JSON.parse(usuariosJSON);
                // Pega o primeiro usuário do tipo 'paciente' como fallback
                usuarioLogado = usuarios.find(u => u.tipo === 'paciente');
                console.log('[refeicoes.js] Usuário encontrado em localStorage.usuarios:', usuarioLogado);
            } catch (e) {
                console.error('[refeicoes.js] Erro ao parsear usuarios:', e);
            }
        }
    }

    // Validação final
    if (!usuarioLogado || !usuarioLogado.id) {
        console.error('[refeicoes.js] Usuário logado não encontrado ou sem ID');
        alert("Sessão não encontrada. Por favor, faça o login novamente.");
        window.location.href = "../login/index.html";
        return;
    }

    console.log('[refeicoes.js] ID do usuário logado:', usuarioLogado.id);
    
    // Passo 1: Encontrar o plano do usuário logado
    const planos = JSON.parse(localStorage.getItem('planosAlimentares')) || [];
    console.log('[refeicoes.js] Planos disponíveis:', planos);
    
    const planoDoUsuario = planos.find(p => p.cliente_id == usuarioLogado.id);
    console.log('[refeicoes.js] Plano encontrado:', planoDoUsuario);

    if (!planoDoUsuario) {
        console.warn('[refeicoes.js] Nenhum plano encontrado para o cliente_id:', usuarioLogado.id);
        containerEl.innerHTML = '<p class="mensagem-vazio">Nenhuma refeição cadastrada para esta semana.</p>';
        return;
    }
    
    // Passo 2: Filtrar as refeições que pertencem a esse plano E a essa semana
    const todasRefeicoes = JSON.parse(localStorage.getItem('refeicoes')) || [];
    console.log('[refeicoes.js] Total de refeições no sistema:', todasRefeicoes.length);
    
    const refeicoesDaSemana = todasRefeicoes.filter(r => 
        r.plano_id === planoDoUsuario.id && r.semana == semanaNumero
    );
    console.log('[refeicoes.js] Refeições da semana', semanaNumero, ':', refeicoesDaSemana);

    if (refeicoesDaSemana.length === 0) {
        containerEl.innerHTML = '<p class="mensagem-vazio">Nenhuma refeição cadastrada para esta semana.</p>';
        return;
    }

    // Passo 3: Agrupar as refeições encontradas por dia
    const refeicoesAgrupadasPorDia = refeicoesDaSemana.reduce((acc, refeicao) => {
        const diaKey = `dia${refeicao.dia}`;
        if (!acc[diaKey]) acc[diaKey] = [];
        acc[diaKey].push(refeicao);
        acc[diaKey].sort((a, b) => a.horario.localeCompare(b.horario));
        return acc;
    }, {});

    console.log('[refeicoes.js] Refeições agrupadas por dia:', refeicoesAgrupadasPorDia);

    // Passo 4: Renderizar os cards dos dias na tela
    containerEl.innerHTML = '';
    let diasRenderizados = 0;
    
    for (let i = 1; i <= 7; i++) {
        const refeicoesDoDia = refeicoesAgrupadasPorDia[`dia${i}`];

        if (refeicoesDoDia && refeicoesDoDia.length > 0) {
            diasRenderizados++;
            const cardDia = document.createElement('div');
            cardDia.className = 'card-dia';
            
            const refeicoesHTML = refeicoesDoDia.map(refeicao => `
                <div class="refeicao">
                    <div class="refeicao-header">
                        <span class="refeicao-tipo">${refeicao.tipo}</span>
                        <span class="refeicao-horario">${refeicao.horario}</span>
                    </div>
                    <div class="refeicao-detalhes">
                        <span>${refeicao.alimento}</span>
                        <span>${refeicao.quantidade}</span>
                    </div>
                </div>
            `).join('');

            cardDia.innerHTML = `<h2>DIA ${i}</h2> ${refeicoesHTML}`;
            containerEl.appendChild(cardDia);
        }
    }

    if (diasRenderizados === 0) {
        containerEl.innerHTML = '<p class="mensagem-vazio">Nenhuma refeição cadastrada para esta semana.</p>';
    }
    
    console.log('[refeicoes.js] Total de dias renderizados:', diasRenderizados);
});