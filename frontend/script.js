// MEMÓRIA GLOBAL DO SISTEMA DE PELADA
const ESTADO_PELADA = {
    todosOsTimes: [],
    filaEspera: [],
    goleirosFixos: [],
    jogadoresPorTime: 6
};


// ==========================================
// 1. CONFIGURAÇÃO DO ROTEADOR (SPA - Navigo)
// ==========================================
const router = new Navigo("/");
const appContent = document.getElementById('app-content');

router.on('/', () => {
    appContent.innerHTML = `...todo o HTML dos jogadores...`;
});

// Função para atualizar o menu ativo
function setMenuAtivo(id) {
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ==========================================
// 2. DEFINIÇÃO DAS TELAS (ROTAS)
// ==========================================
router
  .on("/", () => {
      // Tela: VISÃO GERAL (Dashboard)
      setMenuAtivo('menu-home');
      appContent.innerHTML = `
          <div class="header-title">
              <h1>Visão Geral</h1>
              <p style="color: #666; margin-top: 5px;">Resumo das atividades da sua temporada.</p>
          </div>
          <div class="card">
             <h3>Próxima Partida</h3>
             <p><strong>Hoje, 19:30</strong> - Arena Society</p>
          </div>
      `;
  })
  .on("/matches", () => {
      // Tela: SORTEIO DE TIMES (A tela que já tínhamos pronta)
      setMenuAtivo('menu-matches');
      appContent.innerHTML = `
          <div class="header-title">
              <h1>Sorteio de Times</h1>
              <p style="color: #666;">Gerencie os jogadores e faça o sorteio automático.</p>
          </div>

          <div class="card">
              <h3>Adicionar Novo Jogador</h3>
              <form id="formJogador" class="form-group">
                  <input type="text" id="nome" placeholder="Nome do Jogador" required>
                  <select id="posicao" required>
                      <option value="" disabled selected>Escolha a Posição...</option>
                      <option value="Goleiro">Goleiro</option>
                      <option value="Zagueiro">Zagueiro</option>
                      <option value="Lateral">Lateral</option>
                      <option value="Volante">Volante</option>
                      <option value="Meio-Campo">Meio-Campo</option>
                      <option value="Atacante">Atacante</option>
                  </select>
                  <button type="submit" class="btn-primary">Cadastrar</button>
              </form>
          </div>

          <div class="card">
              <h3>Confirmados</h3>
              <table>
                  <thead>
                      <tr>
                          <th>Nome do Craque</th>
                          <th>Posição</th>
                          <th style="text-align: center;">Ação</th>
                      </tr>
                  </thead>
                  <tbody id="listaJogadores"></tbody>
              </table>
          </div>

          <div class="card">
              <div class="sorteio-header">
                  <h3>Equipes Formadas</h3>
                  <button id="btnSortear" class="btn-primary">🤖 Sortear Times com IA</button>
              </div>
              <div class="teams-container">
                  <div class="team-card">
                      <h4>Time A</h4><ul id="equipaA"></ul>
                  </div>
                  <div class="team-card">
                      <h4>Time B</h4><ul id="equipaB"></ul>
                  </div>
              </div>
          </div>
      `;
      // Como injetamos o HTML agora, precisamos chamar as funções do sorteio
      inicializarLogicaSorteio(); 
  })
  .on("/financial", () => {
      setMenuAtivo('menu-financial');
      appContent.innerHTML = `<h1>Financeiro</h1><p>Gestão de pagamentos (Em breve)</p>`;
  })
  .on("/stats", () => {
      setMenuAtivo('menu-stats');
      appContent.innerHTML = `<h1>Estatísticas e Artilharia</h1><p>Top Scorers (Em breve)</p>`;
  });

// Inicia o roteador
router.resolve();
// ==========================================
// ROTA DE SORTEIO E PARTIDAS (NOVA E DINÂMICA)
// ==========================================
router.on('/matches', () => {
    setMenuAtivo('menu-matches'); 
    
    // Injeta apenas um PAINEL VAZIO, onde o Javascript vai desenhar os times
    appContent.innerHTML = `
        <div class="container" style="max-width: 1400px; margin: 0 auto;">
            <h2>⚙️ Sorteio de Times e Rotação</h2>
            <p>Clique abaixo para puxar os jogadores e montar todos os times da noite.</p>
            
            <button id="btn-sorteio-inicial" style="padding: 12px 20px; font-size: 16px; cursor: pointer; background: #28a745; color: white; border: none; border-radius: 5px; margin-bottom: 25px;">
                🎲 Realizar Sorteio Inicial
            </button>

            <!-- O SEGREDO ESTÁ AQUI: Um painel vazio que aceita N times -->
            <div id="painel-geral-times" style="display: flex; gap: 20px; flex-wrap: wrap; align-items: flex-start;">
                <!-- Os times e a fila serão injetados aqui dinamicamente pelo JS -->
            </div>
        </div>
    `;

    document.getElementById('btn-sorteio-inicial').addEventListener('click', iniciarPelada);
});

// ==========================================
// 3. LÓGICA DE DADOS (AXIOS, SWEETALERT E CONFETTI)
// ==========================================

// Esta função é chamada pelo Navigo sempre que entramos na tela de Sorteio
function inicializarLogicaSorteio() {
    carregarPlantel(); // Carrega a tabela mal a tela abre

    // 1. Cadastrar Jogador
    const form = document.getElementById('formJogador');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('nome').value;
            const posicao = document.getElementById('posicao').value;

            try {
                // USANDO AXIOS: Muito mais limpo que o fetch() original
                await axios.post('/api/jogadores', { nome, posicao });
                
                // USANDO SWEETALERT2: Alerta profissional de sucesso
                Swal.fire({
                    title: 'Golo!',
                    text: 'Craque registado com sucesso!',
                    icon: 'success',
                    confirmButtonColor: '#28a745'
                });

                document.getElementById('nome').value = '';
                document.getElementById('posicao').value = '';
                carregarPlantel(); // Atualiza a tabela
            } catch (error) {
                Swal.fire('Erro', 'Falha ao cadastrar jogador', 'error');
            }
        });
    }

// 2. Sorteio de Equipas (Com regra de 6 na Linha + Fila de Espera)
const btnSortear = document.getElementById('btnSortear');
if (btnSortear) {
    btnSortear.addEventListener('click', async () => {
        try {
            const res = await axios.get('/api/jogadores');
            const jogadores = res.data;

            // Agora exigimos 12 pessoas no mínimo (2 times de 6)
            if (jogadores.length < 12) {
                Swal.fire('Calma aí!', 'Precisas de pelo menos 12 jogadores para fechar os dois primeiros times da quadra.', 'warning');
                return;
            }

            // 1. Usa a nossa nova função de separar os guarda-redes da linha
            const { listaGoleiros, listaLinha } = separarElenco(jogadores);

            // 2. Usa o nosso embaralhador profissional (Fisher-Yates) em vez do Math.random
            const linhaSorteada = embaralharLista(listaLinha);

            // 3. Aplica a Regra da Quadra usando o Slice (Fatiamento)
            ESTADO_PELADA.timeEmQuadraA = linhaSorteada.slice(0, 6);
            ESTADO_PELADA.timeEmQuadraB = linhaSorteada.slice(6, 12);
            ESTADO_PELADA.filaEspera = linhaSorteada.slice(12); // Quem sobrou cai aqui!
            ESTADO_PELADA.goleirosFixos = listaGoleiros;

            // 4. Limpa as listas no HTML
            const ulA = document.getElementById('equipaA');
            const ulB = document.getElementById('equipaB');
            const ulFila = document.getElementById('filaEspera'); // Vai precisar criar esta <ul> no HTML!
            
            ulA.innerHTML = ''; 
            ulB.innerHTML = '';
            if (ulFila) ulFila.innerHTML = '';

            // 5. Renderiza os Goleiros fixos primeiro (se existirem)
            if (listaGoleiros[0]) ulA.innerHTML += `<li>🧤 <strong>${listaGoleiros[0].nome}</strong> <em style="color:#888; font-size:12px;">(Goleiro)</em></li>`;
            if (listaGoleiros[1]) ulB.innerHTML += `<li>🧤 <strong>${listaGoleiros[1].nome}</strong> <em style="color:#888; font-size:12px;">(Goleiro)</em></li>`;

            // 6. Renderiza os times de linha (exatamente 6 cada)
            ESTADO_PELADA.timeEmQuadraA.forEach(j => ulA.innerHTML += `<li><strong>${j.nome}</strong> <em style="color:#888; font-size:12px;">(${j.posicao})</em></li>`);
            ESTADO_PELADA.timeEmQuadraB.forEach(j => ulB.innerHTML += `<li><strong>${j.nome}</strong> <em style="color:#888; font-size:12px;">(${j.posicao})</em></li>`);

            // 7. Renderiza a fila de espera na tela
            if (ulFila) {
                ESTADO_PELADA.filaEspera.forEach(j => ulFila.innerHTML += `<li>⏳ <strong>${j.nome}</strong> <em style="color:#888; font-size:12px;">(${j.posicao})</em></li>`);
            }

            // A sua festa original mantida intacta!
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            Swal.fire('Sorteio Realizado!', 'Times de 6 formados. Quem sobrou está na fila de espera!', 'success');

        } catch (error) {
            console.error(error);
            Swal.fire('Erro', 'Não foi possível realizar o sorteio', 'error');
        }
    });
}

// 3. Função para carregar a tabela com botão de apagar
async function carregarPlantel() {
    try {
        const res = await axios.get('/api/jogadores');
        const jogadores = res.data;
        const tbody = document.getElementById('listaJogadores');
        
        if (!tbody) return;
        tbody.innerHTML = '';

        jogadores.forEach(j => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${j.nome}</strong></td>
                    <td><span style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #555;">${j.posicao}</span></td>
                    <td style="text-align: center;">
                        <button onclick="removerJogador(${j.id})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Excluir</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar plantel:", error);
    }
}

// 4. Função Global para remover (precisa estar no window para o HTML a encontrar)
window.removerJogador = async function(id) {
    // Pergunta de confirmação super elegante com SweetAlert
    const confirmacao = await Swal.fire({
        title: 'Expulsar jogador?',
        text: "Ele vai ficar de fora da pelada!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#ccc',
        confirmButtonText: 'Sim, dar cartão vermelho!',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacao.isConfirmed) {
        try {
            await axios.delete('/api/jogadores/' + id);
            Swal.fire('Expulso!', 'O jogador foi retirado da lista.', 'success');
            carregarPlantel();
        } catch(error) {
            Swal.fire('Erro', 'Não foi possível remover o jogador.', 'error');
        }
    }
};
// ==========================================
// LÓGICA DO FINANCEIRO
// ==========================================

// Função para carregar os selects do formulário financeiro
async function carregarDadosFinanceiro() {
    try {
        // Busca jogadores e partidas no backend
        const [jogadoresRes, partidasRes] = await Promise.all([
            axios.get('http://localhost:3000/api/jogadores'), // Garante que a porta está correta
            axios.get('http://localhost:3000/api/partidas')
        ]);

        const selectJogador = document.getElementById('pagamento-jogador');
        const selectPartida = document.getElementById('pagamento-partida');

        // Limpa e preenche jogadores
        selectJogador.innerHTML = '<option value="">Selecione o Jogador...</option>';
        jogadoresRes.data.forEach(jogador => {
            selectJogador.innerHTML += `<option value="${jogador.id}">${jogador.nome} (${jogador.posicao})</option>`;
        });

        // Limpa e preenche partidas
        selectPartida.innerHTML = '<option value="">Selecione a Partida...</option>';
        partidasRes.data.forEach(partida => {
            const dataFormatada = new Date(partida.data).toLocaleDateString('pt-BR');
            selectPartida.innerHTML += `<option value="${partida.id}">Jogo de ${dataFormatada} - ${partida.status}</option>`;
        });

    } catch (error) {
        console.error("Erro ao carregar dados do financeiro", error);
        Swal.fire('Erro', 'Não foi possível carregar a lista de jogadores ou partidas.', 'error');
    }
}

// Evento de submissão do formulário de pagamento
document.getElementById('form-pagamento')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const pagamento = {
        jogadorId: document.getElementById('pagamento-jogador').value,
        partidaId: document.getElementById('pagamento-partida').value,
        valor: document.getElementById('pagamento-valor').value,
        metodo: document.getElementById('pagamento-metodo').value,
        status: document.getElementById('pagamento-status').value
    };

    try {
        await axios.post('http://localhost:3000/api/pagamentos', pagamento);
        Swal.fire('Sucesso!', 'Pagamento registado no caixa do Gestão 4ssss!', 'success');
        e.target.reset(); // Limpa o formulário
    } catch (error) {
        Swal.fire('Erro', 'Ocorreu um erro ao registar o pagamento.', 'error');
    }
});
// ==========================================
// CÉREBRO DA PELADA (SORTEIO E ROTAÇÃO)
// ==========================================

// 1. A Memória do Jogo
const ESTADO_PELADA = {
    jogadoresPorTime: 6,
    goleirosFixos: [],
    timeEmQuadraA: [],
    timeEmQuadraB: [],
    filaEspera: []
};

// 2. Filtro de Goleiros
function separarElenco(elencoCompleto) {
    const goleiros = elencoCompleto.filter(j => j.posicao === 'Goleiro');
    const linha = elencoCompleto.filter(j => j.posicao !== 'Goleiro');
    return { listaGoleiros: goleiros, listaLinha: linha };
}

// 3. Embaralhador Aleatório (Sorteio Fisher-Yates)
function embaralharLista(lista) {
    const listaSorteada = [...lista]; 
    for (let i = listaSorteada.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [listaSorteada[i], listaSorteada[j]] = [listaSorteada[j], listaSorteada[i]];
    }
    return listaSorteada;
}

// 4. A Máquina de Rotação (A regra da quadra 4sss)
function rotacionarTimes(timePerdedor, filaDeEsperaAtual, tamanhoIdeal) {
    const carencia = tamanhoIdeal - filaDeEsperaAtual.length;
    const perdedoresSorteados = embaralharLista(timePerdedor);
    
    const sortudos = perdedoresSorteados.slice(0, carencia);
    const novoTimeParaEntrar = filaDeEsperaAtual.concat(sortudos);
    const novaFilaDeEspera = perdedoresSorteados.slice(carencia);

    return {
        novoTime: novoTimeParaEntrar,
        novaFila: novaFilaDeEspera
    };
}
// ==========================================
// FUNÇÃO: SORTEIO INICIAL (DINÂMICO)
// ==========================================
async function iniciarPelada() {
    try {
        const resposta = await axios.get('http://localhost:3000/api/jogadores');
        const elencoCompleto = resposta.data;

        if (elencoCompleto.length < 12) {
            Swal.fire('Atenção', 'Precisamos de pelo menos 12 jogadores.', 'warning');
            return;
        }

        const { listaGoleiros, listaLinha } = separarElenco(elencoCompleto);
        const linhaEmbaralhada = embaralharLista(listaLinha);

        // MÁGICA: Calcula quantos times de 6 dão para montar!
        const tamanhoTime = 6;
        const qtdTimesPossiveis = Math.floor(linhaEmbaralhada.length / tamanhoTime);
        
        ESTADO_PELADA.todosOsTimes = [];
        let indice = 0;

        for (let i = 0; i < qtdTimesPossiveis; i++) {
            ESTADO_PELADA.todosOsTimes.push(linhaEmbaralhada.slice(indice, indice + tamanhoTime));
            indice += tamanhoTime;
        }

        ESTADO_PELADA.filaEspera = linhaEmbaralhada.slice(indice);
        ESTADO_PELADA.goleirosFixos = listaGoleiros;

        renderizarTimesNaTela();

        if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        Swal.fire('Sorteio Concluído!', `${qtdTimesPossiveis} times formados com sucesso!`, 'success');

    } catch (erro) {
        console.error("Erro no sorteio:", erro);
        Swal.fire('Erro', 'Não foi possível buscar os jogadores.', 'error');
    }
}

// ==========================================
// FUNÇÃO: DESENHAR MÚLTIPLOS TIMES NA TELA
// ==========================================
function renderizarTimesNaTela() {
    const painelGeral = document.getElementById('painel-geral-times');
    if (!painelGeral) {
        console.error("ERRO: O HTML não tem a div 'painel-geral-times'. Verifique a rota /matches.");
        return;
    }

    painelGeral.innerHTML = ''; 

    // Desenha todos os times que o cálculo gerou
    ESTADO_PELADA.todosOsTimes.forEach((time, index) => {
        let htmlJogadores = '';

        if (index === 0 && ESTADO_PELADA.goleirosFixos[0]) {
            htmlJogadores += `<li>🧤 <strong>${ESTADO_PELADA.goleirosFixos[0].nome}</strong> <em style="color:#888; font-size:12px;">(Goleiro)</em></li>`;
        } else if (index === 1 && ESTADO_PELADA.goleirosFixos[1]) {
            htmlJogadores += `<li>🧤 <strong>${ESTADO_PELADA.goleirosFixos[1].nome}</strong> <em style="color:#888; font-size:12px;">(Goleiro)</em></li>`;
        }

        time.forEach(j => {
            htmlJogadores += `<li><strong>${j.nome}</strong> <em style="color:#888; font-size:12px;">(${j.posicao})</em></li>`;
        });

        painelGeral.innerHTML += `
            <div style="flex: 1; min-width: 250px; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
                <h3 style="color: #28a745; text-align: center; margin-top: 0;">Time ${index + 1}</h3>
                <ul style="list-style: none; padding: 0; margin-bottom: 15px;">${htmlJogadores}</ul>
                <button onclick="vitoriaTime(${index})" style="width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🏆 Time ${index + 1} Venceu
                </button>
            </div>
        `;
    });

    // Desenha a Fila de Espera
    let htmlFila = '';
    ESTADO_PELADA.filaEspera.forEach(j => {
        htmlFila += `<li>⏳ <strong>${j.nome}</strong> <em style="color:#888; font-size:12px;">(${j.posicao})</em></li>`;
    });

    painelGeral.innerHTML += `
        <div style="flex: 1; min-width: 250px; background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeeba;">
            <h3 style="color: #856404; text-align: center; margin-top: 0;">⏳ Fila de Espera</h3>
            <ul style="list-style: none; padding: 0;">${htmlFila || '<li style="color:#888; text-align:center;">Vazia</li>'}</ul>
        </div>
    `;
}
}