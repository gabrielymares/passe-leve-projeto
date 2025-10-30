document.addEventListener('DOMContentLoaded', () => {
    carregarPerfilNutricionista();
    document.getElementById('logout-button').addEventListener('click', fazerLogout);
});

// Dados de exemplo do Nutricionista
const DADOS_NUTRICIONISTA_EXEMPLO = {
    nome: "Dra. Ana Silva",
    crn: "12345/SP",
    contatoAcesso: "ana.silva@passeleve.com",
    contatoProfissional: "(11) 99887-7654"
};

function carregarPerfilNutricionista() {
    // Carrega dados do usuário logado (chave correta: 'usuario')
    const usuarioLogado = localStorage.getItem('usuario');
    
    if (!usuarioLogado) {
        // Se não houver usuário logado, usa dados de exemplo
        const dadosNutri = DADOS_NUTRICIONISTA_EXEMPLO;
        document.getElementById('perfil-nome').textContent = dadosNutri.nome || '--';
        document.getElementById('nutri-crn').textContent = dadosNutri.crn || '--';
        document.getElementById('nutri-email').textContent = dadosNutri.contatoAcesso || '--';
        document.getElementById('nutri-contato').textContent = dadosNutri.contatoProfissional || '--';
        return;
    }

    const dadosNutri = JSON.parse(usuarioLogado);

    // Verifica se é realmente um nutricionista
    if (dadosNutri.tipo !== 'nutricionista') {
        alert('Acesso negado. Esta página é apenas para nutricionistas.');
        window.location.href = '../login/cadastro.html';
        return;
    }

    // Preenche as informações na página
    document.getElementById('perfil-nome').textContent = dadosNutri.nome || '--';
    document.getElementById('nutri-crn').textContent = dadosNutri.crn || '--';
    document.getElementById('nutri-email').textContent = dadosNutri.contatoAcesso || '--';
    document.getElementById('nutri-contato').textContent = dadosNutri.contatoProfissional || '--';
}

function fazerLogout() {
    // Limpa dados de login do localStorage
    localStorage.removeItem('usuario');
    
    // Redireciona para a tela de login
    alert("Logout realizado com sucesso!");
    window.location.href = '../login/cadastro.html';
}