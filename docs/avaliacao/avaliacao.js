/**
 * @param {Event} evt - O evento de clique.
 * @param {string} nomeAba - O ID do conteúdo da aba a ser exibida.
 */
function abrirAba(evt, nomeAba) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.getElementById(nomeAba).classList.add('active');
    evt.currentTarget.classList.add('active');
}

/**
 * Mostra ou esconde as opções de resposta de uma pergunta.
 * @param {HTMLElement} element - O elemento do título da pergunta que foi clicado.
 */
function toggleResposta(element) {
    const respostas = element.nextElementSibling;
    respostas.classList.toggle('active');
    element.classList.toggle('active');
}

/**
 * Configura os eventos para os checkboxes de alergia (P2) para terem um comportamento lógico.
 */
function inicializarCheckboxesAlergia() {
    const checkboxes = document.querySelectorAll('input[name="p2_alergia"]');
    
    checkboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            const parent = this.closest('.respostas');
            const cbNenhuma = parent.querySelector('input[name="p2_alergia"][value="nenhuma"]');
            
            if (this.value === 'nenhuma' && this.checked) {
                // Se "nenhuma" for marcada, desmarca todas as outras
                parent.querySelectorAll('input[name="p2_alergia"]').forEach(i => {
                    if (i.value !== 'nenhuma') i.checked = false;
                });
                const campoOutros = parent.querySelector('input[name="p2_outros"]');
                if (campoOutros) {
                    campoOutros.style.display = 'none';
                    campoOutros.value = '';
                }
            } else if (this.checked && cbNenhuma && cbNenhuma.checked) {
                // Se outra opção for marcada, desmarca "nenhuma"
                cbNenhuma.checked = false;
            }

            // Mostra ou esconde o campo de texto "outros"
            if (this.value === 'outros') {
                const campoOutros = parent.querySelector('input[name="p2_outros"]');
                if (campoOutros) {
                    campoOutros.style.display = this.checked ? 'inline-block' : 'none';
                    if (!this.checked) campoOutros.value = '';
                }
            }
        });
    });
}

/**
 * Mostra um campo de texto quando a opção "sim" ou "outros" é selecionada.
 * @param {HTMLElement} element - O input (radio ou checkbox) que acionou a função.
 */
function mostrarCampoOutros(element) {
    const parent = element.closest('.respostas');
    const name = element.name;
    let campoOutrosName = '';

    if (name === 'p1_doenca') campoOutrosName = 'p1_outros';
    else if (name === 'p3_restricao') campoOutrosName = 'p3_outros';
    
    if (campoOutrosName) {
        const campoOutros = parent.querySelector(`input[name="${campoOutrosName}"]`);
        if (campoOutros) {
            const shouldShow = element.value === 'sim';
            campoOutros.style.display = shouldShow ? 'inline-block' : 'none';
            if (!shouldShow) campoOutros.value = '';
        }
    }
}

/**
 * Valida se todas as perguntas obrigatórias do formulário foram respondidas.
 * @returns {boolean} - Retorna true se o formulário for válido, false caso contrário.
 */
function validarFormulario() {
    const perguntasObrigatorias = [
        'p1_doenca', 'p3_restricao', 'p4_exercicio', 'p5_apetite', 'p7_refeicoes', 'p10_emocional'
    ];
    
    for (const name of perguntasObrigatorias) {
        if (!document.querySelector(`input[name="${name}"]:checked`)) {
            alert('Por favor, responda todas as perguntas de escolha única.');
            return false;
        }
    }

    if (document.querySelectorAll('input[name="p6_objetivo"]:checked').length === 0) {
        alert('Por favor, selecione pelo menos um objetivo (Pergunta 6).');
        return false;
    }
    
    if (document.querySelectorAll('input[name="p2_alergia"]:checked').length === 0) {
        alert('Por favor, marque pelo menos uma opção para a pergunta de alergia/intolerância (Pergunta 2).');
        return false;
    }

    const camposOutros = [
        { trigger: 'input[name="p1_doenca"][value="sim"]:checked', field: 'input[name="p1_outros"]' },
        { trigger: 'input[name="p2_alergia"][value="outros"]:checked', field: 'input[name="p2_outros"]' },
        { trigger: 'input[name="p3_restricao"][value="sim"]:checked', field: 'input[name="p3_outros"]' }
    ];

    for (const item of camposOutros) {
        if (document.querySelector(item.trigger)) {
            const campo = document.querySelector(item.field);
            if (!campo || !campo.value.trim()) {
                alert('Preencha o campo de especificação para sua resposta "Sim" ou "Outros".');
                campo?.focus();
                return false;
            }
        }
    }

    return true;
}

/**
 * Mostra um estado de "carregando" no botão de submit e o desativa.
 * @returns {function} - Uma função para reverter o botão ao seu estado original.
 */
function mostrarLoading() {
    const botao = document.querySelector('#formulario-avaliacao button[type="submit"]');
    const textoOriginal = botao.innerHTML;
    botao.innerHTML = 'Processando... ⏳';
    botao.disabled = true;
    botao.style.opacity = '0.7';
    return () => {
        botao.innerHTML = textoOriginal;
        botao.disabled = false;
        botao.style.opacity = '1';
    };
}

// ============================================
// CÓDIGO PRINCIPAL DA PÁGINA
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Nota: O script 'verificarSessao.js' deve ter sido executado antes deste,
    // garantindo que o usuário está logado e precisa preencher esta avaliação.
    
    inicializarCheckboxesAlergia();
    const formulario = document.getElementById('formulario-avaliacao');

    formulario.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        const reverterLoading = mostrarLoading();

        // --- 1. CÁLCULO DE PONTUAÇÃO E GRUPO ---
        let pontuacaoTotal = 0;
        const respostasPontuadas = {
            p1_doenca: { 'nao': 10, 'sim': 0 },
            p4_exercicio: { 'diariamente': 10, 'algumas_vezes': 5, 'raramente': 0 },
            p5_apetite: { 'normal': 10, 'baixo': 0, 'aumentado': 0 },
            p7_refeicoes: { '3_ou_4': 10, '2_ou_menos': 0, '5_ou_mais': 0 },
            p10_emocional: { 'nunca': 10, 'as_vezes': 5, 'sempre': 0 }
        };

        Object.keys(respostasPontuadas).forEach(name => {
            const resposta = document.querySelector(`input[name="${name}"]:checked`)?.value;
            if (resposta) {
                pontuacaoTotal += respostasPontuadas[name][resposta] || 0;
            }
        });

        // --- 2. CLASSIFICAÇÃO EM GRUPOS ---
        const alergias = Array.from(document.querySelectorAll('input[name="p2_alergia"]:checked')).map(cb => cb.value);
        const temAlergiaIntestinal = alergias.includes('lactose') || alergias.includes('gluten') || alergias.includes('outros');

        const doencaTexto = document.querySelector('input[name="p1_doenca"][value="sim"]:checked') ? (document.querySelector('input[name="p1_outros"]')?.value.toLowerCase() || '') : '';
        const restricaoTexto = document.querySelector('input[name="p3_restricao"][value="sim"]:checked') ? (document.querySelector('input[name="p3_outros"]')?.value.toLowerCase() || '') : '';
        const indicativosMetabolicos = ['diabetes', 'hipertensão', 'hipertenso', 'colesterol', 'renal'];
        const temRestricaoMetabolica = indicativosMetabolicos.some(cond => restricaoTexto.includes(cond) || doencaTexto.includes(cond));

        let grupo = '';
        if (temAlergiaIntestinal) {
            grupo = 'Grupo 2 – Condições Intestinais';
        } else if (temRestricaoMetabolica) {
            grupo = 'Grupo 1 – Condições Metabólicas';
        } else if (pontuacaoTotal >= 40) {
            grupo = 'Grupo 3 – Estilo de Vida Saudável';
        } else if (pontuacaoTotal >= 25) {
            grupo = 'Grupo 2 – Condições Intestinais';
        } else {
            grupo = 'Grupo 1 – Condições Metabólicas';
        }
        
        // --- 3. MONTAGEM DO OBJETO DE AVALIAÇÃO ---
        const dadosAvaliacao = {
            pontuacao: pontuacaoTotal,
            grupo: grupo,
            p1_doenca: document.querySelector('input[name="p1_doenca"]:checked')?.value,
            p1_doenca_outros: doencaTexto,
            p2_alergia: alergias.filter(v => v !== 'nenhuma'),
            p2_alergia_outros: document.querySelector('input[name="p2_outros"]')?.value || '',
            p3_restricao: document.querySelector('input[name="p3_restricao"]:checked')?.value,
            p3_restricao_outros: restricaoTexto,
            p4_exercicio: document.querySelector('input[name="p4_exercicio"]:checked')?.value,
            p5_apetite: document.querySelector('input[name="p5_apetite"]:checked')?.value,
            p6_objetivo: Array.from(document.querySelectorAll('input[name="p6_objetivo"]:checked')).map(cb => cb.value),
            p7_refeicoes: document.querySelector('input[name="p7_refeicoes"]:checked')?.value,
            p8_alimentos_evita: document.querySelector('textarea[name="p8_alimentos_evita"]')?.value || '',
            p9_frequencia: document.querySelector('textarea[name="p9_frequencia"]')?.value || '',
            p10_emocional: document.querySelector('input[name="p10_emocional"]:checked')?.value,
            timestamp: new Date().toISOString()
        };

        // --- 4. LÓGICA DE SALVAMENTO CENTRALIZADA ---
        try {
            const usuarioSessao = JSON.parse(localStorage.getItem('usuario'));
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

            if (!usuarioSessao) {
                throw new Error("Sessão não encontrada. Faça o login novamente.");
            }
            
            let usuarioAtualizado = null;

            const usuariosAtualizados = usuarios.map(user => {
                if (user.contatoAcesso === usuarioSessao.contatoAcesso) {
                    usuarioAtualizado = { ...user, avaliacao: dadosAvaliacao };
                    return usuarioAtualizado;
                }
                return user;
            });
            
            if (!usuarioAtualizado) {
                 throw new Error("Usuário não encontrado na base de dados para atualização.");
            }

            // Salva a lista principal de usuários com os novos dados
            localStorage.setItem('usuarios', JSON.stringify(usuariosAtualizados));
            // Atualiza a sessão ativa com os dados completos
            localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));

            // --- 5. REDIRECIONAMENTO ---
            setTimeout(() => {
                reverterLoading();
                window.location.href = "../pontuacao/pontuacao.html";
            }, 500);

        } catch (error) {
            console.error("Falha ao salvar a avaliação do usuário:", error);
            alert("Ocorreu um erro ao salvar sua avaliação. Por favor, tente novamente.");
            reverterLoading();
        }
    });
});