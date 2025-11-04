document.addEventListener('DOMContentLoaded', () => {
    carregarPerfilNutricionista();
    
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', fazerLogout);
    }
});

function carregarPerfilNutricionista() {
    try {
        // 1. Buscar dados do nutricionista logado
        let nutricionista = null;
        
        // Tenta buscar de 'usuario' primeiro (se for a sessão ativa)
        const usuarioLogado = localStorage.getItem('usuario');
        if (usuarioLogado) {
            const usuario = JSON.parse(usuarioLogado);
            if (usuario.tipo === 'nutricionista') {
                nutricionista = usuario;
            }
        }
        
        // Se não encontrou, busca na lista de usuários
        if (!nutricionista) {
            const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            nutricionista = usuarios.find(u => u.tipo === 'nutricionista');
        }
        
        // Se ainda não encontrou, usa dados padrão
        if (!nutricionista) {
            console.warn('[perfil.js] Nutricionista não encontrado, usando dados padrão');
            nutricionista = {
                nome: "Nutricionista",
                crn: "Não informado",
                contatoAcesso: "Não informado"
            };
        }

        console.log('[perfil.js] Nutricionista carregado:', nutricionista);

        // 2. Preencher as informações no HTML (usando os IDs CORRETOS)
        const elementos = {
            nome: document.getElementById('perfil-nome'),
            crn: document.getElementById('nutri-crn'),
            email: document.getElementById('nutri-email'),
            contato: document.getElementById('nutri-contato')
        };

        // Verificar se os elementos existem antes de preencher
        if (elementos.nome) {
            elementos.nome.textContent = nutricionista.nome || 'Não informado';
        }
        
        if (elementos.crn) {
            elementos.crn.textContent = nutricionista.crn || nutricionista.perfil?.crn || 'Não informado';
        }
        
        if (elementos.email) {
            elementos.email.textContent = nutricionista.email || nutricionista.contatoAcesso || 'Não informado';
        }
        
        if (elementos.contato) {
            elementos.contato.textContent = nutricionista.telefone || nutricionista.contatoAcesso || 'Não informado';
        }

        console.log('[perfil.js] Perfil carregado com sucesso');

    } catch (error) {
        console.error('[perfil.js] Erro ao carregar perfil:', error);
        alert('Erro ao carregar perfil. Verifique o console para mais detalhes.');
    }
}

function fazerLogout() {
    try {
        // Limpa os dados de sessão
        localStorage.removeItem('usuario');
        localStorage.removeItem('nutricionistaLogado');
        localStorage.removeItem('nutriUltimoLogin');
        
        console.log('[perfil.js] Logout realizado');
        
        alert("Logout realizado com sucesso!");
        
        // Redireciona para a tela de login (CAMINHO CORRIGIDO!)
        window.location.href = '../index.html'; 
        
    } catch (error) {
        console.error('[perfil.js] Erro ao fazer logout:', error);
        alert('Erro ao fazer logout. Tente novamente.');
    }
}