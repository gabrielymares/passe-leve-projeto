const PAGINA_LOGIN = "cadastro.html";
const PAGINA_FORMULARIO = "../formulario/formulario.html";
const PAGINA_AVALIACAO = "../avaliacao/avaliacao.html";
const PAGINA_INICIAL_PACIENTE = "../paginainicial/paginainicial.html"; // Exemplo de página principal

(function verificarStatusPaciente() {
    const sessaoJSON = localStorage.getItem('usuario');

    // 1. Ninguém está logado? Manda para o login.
    if (!sessaoJSON) {
        // Evita redirecionamento infinito se já estiver na página de login
        if (!window.location.pathname.includes('login')) {
            window.location.href = PAGINA_LOGIN;
        }
        return;
    }

    const usuarioLogado = JSON.parse(sessaoJSON);
    const paginaAtual = window.location.pathname;

    // 2. O usuário é um nutricionista? Deixa ele em paz.
    // (Este script é só para o fluxo do paciente)
    if (usuarioLogado.tipo === 'nutricionista') {
        return;
    }

    // 3. Verifica o progresso do onboarding do PACIENTE
    const perfilCompleto = usuarioLogado.perfil && usuarioLogado.perfil.dataInicio;
    const avaliacaoCompleta = usuarioLogado.avaliacao && usuarioLogado.avaliacao.timestamp;

    // FLUXO DE REDIRECIONAMENTO:

    // Cenário A: Usuário já completou TUDO (perfil + avaliação)
    if (perfilCompleto && avaliacaoCompleta) {
        // Se ele tentar acessar as páginas de formulário ou avaliação de novo,
        // manda ele para a página inicial.
        if (paginaAtual.includes('formulario') || paginaAtual.includes('avaliacao')) {
            window.location.href = PAGINA_INICIAL_PACIENTE;
        }
        return; // Se ele já está na página certa, não faz nada.
    }

    // Cenário B: Usuário completou o PERFIL, mas falta a AVALIAÇÃO
    if (perfilCompleto && !avaliacaoCompleta) {
        // Se ele não estiver na página de avaliação, força o redirecionamento para lá.
        if (!paginaAtual.includes('avaliacao')) {
            window.location.href = PAGINA_AVALIACAO;
        }
        return;
    }

    // Cenário C: Usuário NÃO completou NADA (nem o perfil)
    if (!perfilCompleto) {
        // Se ele não estiver na página de formulário, força o redirecionamento para lá.
        if (!paginaAtual.includes('formulario')) {
            window.location.href = PAGINA_FORMULARIO;
        }
        return;
    }
})();