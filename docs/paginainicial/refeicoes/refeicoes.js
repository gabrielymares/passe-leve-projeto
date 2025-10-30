// refeicoes.js (refeicoes/refeicoes.html) - VERSÃO CORRIGIDA E ROBUSTA

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const semanaNumero = params.get('semana');

    const tituloEl = document.getElementById('titulo-semana');
    const containerEl = document.getElementById('container-dias');

    // --- Validação Inicial ---
    if (!semanaNumero) {
        tituloEl.textContent = "Erro";
        containerEl.innerHTML = '<p class="mensagem-vazio">Número da semana não especificado na URL.</p>';
        return;
    }
    
    // Converte a semana da URL para número inteiro, garantindo consistência
    const numeroSemanaInt = parseInt(semanaNumero);
    if (isNaN(numeroSemanaInt)) {
        tituloEl.textContent = "Erro";
        containerEl.innerHTML = '<p class="mensagem-vazio">Valor de semana inválido.</p>';
        return;
    }
    
    tituloEl.textContent = `Semana ${numeroSemanaInt}`;

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
    
    // CORREÇÃO PRINCIPAL: Garante que os IDs (cliente_id e usuario.id) são comparados como strings
    const planoDoUsuario = planos.find(p => String(p.cliente_id) === String(usuarioLogado.id));

    if (!planoDoUsuario) {
        containerEl.innerHTML = '<p class="mensagem-vazio">Plano alimentar não encontrado para este usuário.</p>';
        return;
    }
    
    // Passo 2: Filtrar as refeições que pertencem a esse plano E a essa semana
    const todasRefeicoes = JSON.parse(localStorage.getItem('refeicoes')) || [];
    
    // CORREÇÃO: Garante que plano_id é comparado como string e semana como number
    const refeicoesDaSemana = todasRefeicoes.filter(r => 
        String(r.plano_id) === String(planoDoUsuario.id) && 
        r.semana === numeroSemanaInt // Usando '===' para garantir que o tipo da semana seja Number
    );

    if (refeicoesDaSemana.length === 0) {
        containerEl.innerHTML = '<p class="mensagem-vazio">Nenhuma refeição cadastrada para a Semana ' + numeroSemanaInt + '.</p>';
        return;
    }

    // Passo 3: Agrupar as refeições encontradas por dia
    const refeicoesAgrupadasPorDia = refeicoesDaSemana.reduce((acc, refeicao) => {
        // Garante que o dia também é tratado de forma consistente (se for salvo como string)
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
        // Esta mensagem só será exibida se o plano e as refeições forem encontrados,
        // mas nenhuma delas for agrupada (o que é improvável se a lógica acima funcionar)
        containerEl.innerHTML = '<p class="mensagem-vazio">Nenhuma refeição encontrada para exibir nesta semana.</p>';
    }
});