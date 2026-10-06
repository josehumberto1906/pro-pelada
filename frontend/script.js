// ==========================================
// 1. CONFIGURAÇÃO DO ROTEADOR (SPA - Navigo)
// ==========================================
const router = new Navigo("/");
const appContent = document.getElementById('app-content');

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

    // 2. Sorteio de Equipas (Com regra de Guarda-Redes/Goleiro)
    const btnSortear = document.getElementById('btnSortear');
    if (btnSortear) {
        btnSortear.addEventListener('click', async () => {
            try {
                // AXIOS para ir buscar os dados
                const res = await axios.get('/api/jogadores');
                const jogadores = res.data;

                if (jogadores.length < 2) {
                    Swal.fire('Calma aí!', 'Precisas de pelo menos 2 jogadores cadastrados.', 'warning');
                    return;
                }

                const goleiros = jogadores.filter(j => j.posicao === 'Goleiro');
                const linha = jogadores.filter(j => j.posicao !== 'Goleiro');

                goleiros.sort(() => Math.random() - 0.5);
                linha.sort(() => Math.random() - 0.5);

                const equipaA = [];
                const equipaB = [];

                goleiros.forEach((g, i) => i % 2 === 0 ? equipaA.push(g) : equipaB.push(g));
                linha.forEach(j => equipaA.length <= equipaB.length ? equipaA.push(j) : equipaB.push(j));

                const ulA = document.getElementById('equipaA');
                const ulB = document.getElementById('equipaB');
                ulA.innerHTML = ''; ulB.innerHTML = '';

                equipaA.forEach(j => ulA.innerHTML += `<li>${j.posicao === 'Goleiro' ? '🧤 ' : ''}<strong>${j.nome}</strong> <em style="color:#888; font-size:12px;">(${j.posicao})</em></li>`);
                equipaB.forEach(j => ulB.innerHTML += `<li>${j.posicao === 'Goleiro' ? '🧤 ' : ''}<strong>${j.nome}</strong> <em style="color:#888; font-size:12px;">(${j.posicao})</em></li>`);

                // USANDO CANVAS-CONFETTI: Efeito de festa quando sorteia!
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 }
                });

                // SWEETALERT2 em vez do alert() feio do navegador
                Swal.fire('Sorteio Realizado!', 'As equipas estão prontas para o apito inicial.', 'success');

            } catch (error) {
                console.error(error);
                Swal.fire('Erro', 'Não foi possível realizar o sorteio', 'error');
            }
        });
    }
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