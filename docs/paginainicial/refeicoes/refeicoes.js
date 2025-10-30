// refeicoes.js (refeicoes/refeicoes.html) - VERSÃO TOTALMENTE CORRIGIDA

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

    // --- Lógica Correta de Busca de Dados ---
    const usuarioJSON = localStorage.getItem('usuario');
    if (!usuarioJSON) {
        alert("Sessão não encontrada. Por favor, faça o login novamente.");
        window.location.href = "../login/index.html";
        return;
    }
    
    const usuarioLogado = JSON.parse(usuarioJSON);
    
    // Passo 1: Encontrar o plano do usuário logado
    const planos = JSON.parse(localStorage.getItem('planosAlimentares')) || [];
    const planoDoUsuario = planos.find(p => p.cliente_id === usuarioLogado.id);

    if (!planoDoUsuario) {
        containerEl.innerHTML = '<p class="mensagem-vazio">Nenhuma refeição cadastrada para esta semana.</p>';
        return;
    }
    
    // Passo 2: Filtrar as refeições que pertencem a esse plano E a essa semana
    const todasRefeicoes = JSON.parse(localStorage.getItem('refeicoes')) || [];
    const refeicoesDaSemana = todasRefeicoes.filter(r => 
        r.plano_id === planoDoUsuario.id && r.semana == semanaNumero
    );

    if (refeicoesDaSemana.length === 0) {
        containerEl.innerHTML = '<p class="mensagem-vazio">Nenhuma refeição cadastrada para esta semana.</p>';
        return;
    }

    // Passo 3: Agrupar as refeições encontradas por dia
    const refeicoesAgrupadasPorDia = refeicoesDaSemana.reduce((acc, refeicao) => {
        const diaKey = `dia${refeicao.dia}`;
        if (!acc[diaKey]) acc[diaKey] = [];
        acc[diaKey].push(refeicao);
        acc[diaKey].sort((a, b) => a.horario.localeCompare(b.horario)); // Ordena por horário
        return acc;
    }, {});

    // Passo 4: Renderizar os cards dos dias na tela
    containerEl.innerHTML = ''; // Limpa o container
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
});