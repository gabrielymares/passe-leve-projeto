document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar se há um usuário logado
    const usuarioJSON = localStorage.getItem('usuario');
    if (!usuarioJSON) {
        alert("Sessão não encontrada. Por favor, faça o login novamente.");
        window.location.href = "../login/index.html";
        return;
    }

    const usuarioLogado = JSON.parse(usuarioJSON);

    // ===============================================
    // NOVAS CHAMADAS DE FUNÇÃO
    // ===============================================
    atualizarTituloComMes();
    carregarGrupoDoPaciente(usuarioLogado);
    // ===============================================
    
    // Função já existente para renderizar os cards
    renderizarCardsDasSemanas(usuarioLogado);
});


/**
 * Atualiza o título principal da página para exibir o mês e o ano atuais.
 * Ex: "Seu Plano de Outubro de 2025"
 */
function atualizarTituloComMes() {
    const tituloEl = document.getElementById('titulo-principal');
    if (!tituloEl) {
        console.error('Elemento com id "titulo-principal" não foi encontrado no HTML.');
        return;
    }

    const agora = new Date();
    const ano = agora.getFullYear();
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const nomeDoMes = meses[agora.getMonth()];

    tituloEl.textContent = `Seu Plano de ${nomeDoMes} de ${ano}`;
}


/**
 * Carrega e exibe o grupo de foco do paciente.
 * @param {object} usuario - O objeto do usuário logado.
 */
function carregarGrupoDoPaciente(usuario) {
    const containerGrupo = document.getElementById('info-grupo-paciente'); 
    if (!containerGrupo) {
        console.error('Elemento com id "info-grupo-paciente" não foi encontrado no HTML.');
        return;
    }

    const grupo = usuario.avaliacao?.grupo;

    if (grupo) {

        containerGrupo.innerHTML = `<strong>Seu Foco:</strong> ${grupo}`;

        containerGrupo.innerHTML = ` ${grupo}`;
 f06a55d498352579680502019c4c9fe0d8d3e9a2
    } else {
        containerGrupo.textContent = 'Grupo ainda não definido pelo nutricionista.';
    }
}


/**
 * Renderiza os 4 cards de semana, verificando se o nutricionista já criou o plano.
 * (Esta função já estava correta da última vez)
 * @param {object} usuario - O objeto do usuário logado.
 */
function renderizarCardsDasSemanas(usuario) {
    const container = document.getElementById('semanas-container');
    if (!container) {
        console.error('Elemento com id "semanas-container" não foi encontrado no HTML.');
        return;
    }

    const planos = JSON.parse(localStorage.getItem('planosAlimentares')) || [];
    const planoDoUsuario = planos.find(p => p.cliente_id === usuario.id);

    let temRefeicoes = false;
    if (planoDoUsuario) {
        const todasRefeicoes = JSON.parse(localStorage.getItem('refeicoes')) || [];
        temRefeicoes = todasRefeicoes.some(r => r.plano_id === planoDoUsuario.id);
    }

    if (!temRefeicoes) {
        container.innerHTML = `
            <div class="mensagem-vazio" style="text-align: center; color: #888; padding: 20px;">
                <h2>Seu plano alimentar está sendo preparado!</h2>
                <p>Aguarde até que seu nutricionista adicione suas refeições.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    for (let i = 1; i <= 4; i++) {
        const cardLink = document.createElement('a');
        cardLink.className = 'semana-card';
        cardLink.href = `refeicoes/refeicoes.html?semana=${i}`;
        cardLink.textContent = `Semana ${i}`;
        container.appendChild(cardLink);
    }
}