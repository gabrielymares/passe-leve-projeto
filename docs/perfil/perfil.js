document.addEventListener('DOMContentLoaded', carregarPerfil);

function carregarPerfil() {
    // =========================================================================
    // ETAPA 1: VERIFICAR SE HÁ UMA SESSÃO ATIVA
    // =========================================================================
    const sessaoJSON = localStorage.getItem('usuario');

    // Se não houver sessão, o usuário não está logado. Interrompe a função.
    if (!sessaoJSON) {
        console.error("Nenhum usuário logado. Exibindo perfil vazio.");
        // O ideal é redirecionar para a página de login para evitar erros
        window.location.href = "../login/index.html"; 
        return;
    }

    const usuarioLogado = JSON.parse(sessaoJSON);

    // =========================================================================
    // ETAPA 2: ACESSAR OS DADOS DIRETAMENTE DO OBJETO DO USUÁRIO (CORREÇÃO)
    // =========================================================================
    // CORREÇÃO: Os dados do perfil e da avaliação agora estão DENTRO do objeto do usuário.
    // Não precisamos mais buscar outros itens no localStorage.
    // Usamos um fallback `|| {}` para evitar erros se o perfil ou avaliação ainda não existirem.
    const dadosPerfil = usuarioLogado.perfil || {};
    const dadosAvaliacao = usuarioLogado.avaliacao || {};


    // =========================================================================
    // ETAPA 3: PREENCHER A PÁGINA COM OS DADOS CORRETOS
    // =========================================================================
    try {
        // --- Preenche dados do Perfil ---
        // O nome e o contato vêm do objeto principal 'usuarioLogado'.
        document.getElementById('perfil-nome').textContent = usuarioLogado.nome || '--';
        document.getElementById('perfil-contato').textContent = usuarioLogado.contatoAcesso || '--';
        
        // O resto dos dados vem do sub-objeto 'dadosPerfil'.
        document.getElementById('perfil-idade').textContent = dadosPerfil.idade || '--';
        document.getElementById('perfil-sexo').textContent = dadosPerfil.sexo || '--';
        
        // Formata os números para exibição
        const altura = dadosPerfil.altura ? Number(dadosPerfil.altura).toFixed(2) : '--';
        const peso = dadosPerfil.peso ? Number(dadosPerfil.peso).toFixed(2) : '--';
        const imc = dadosPerfil.imc ? Number(dadosPerfil.imc).toFixed(2) : '--';

        document.getElementById('perfil-altura').textContent = altura;
        document.getElementById('perfil-peso').textContent = peso;
        document.getElementById('perfil-imc').textContent = imc;

        // --- Preenche dados da Avaliação ---
        const condicoesListUl = document.querySelector('.conditions-list ul');
        if (condicoesListUl) {
            condicoesListUl.innerHTML = ''; // Limpa a lista antes de adicionar itens

            // 1. Grupo (vem do sub-objeto 'dadosAvaliacao')
            const grupo = dadosAvaliacao.grupo || 'Não avaliado';
            const grupoLi = document.createElement('li');
            grupoLi.textContent = `Grupo: ${grupo}`;
            condicoesListUl.appendChild(grupoLi);

            // 2. Alergias (vem do sub-objeto 'dadosAvaliacao')
            // CORREÇÃO: O nome da propriedade é 'p2_alergia', conforme o formulário de avaliação.
            const alergias = dadosAvaliacao.p2_alergia || [];
            if (alergias.length > 0) {
                const li = document.createElement('li');
                li.textContent = `Alergias: ${alergias.join(', ')}`;
                condicoesListUl.appendChild(li);
            }
        }
    } catch (error) {
        console.error("Erro ao preencher os dados do perfil na página:", error);
        // Opcional: Mostrar uma mensagem de erro para o usuário na própria página.
    }
}