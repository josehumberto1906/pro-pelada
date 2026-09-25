// ==========================================
// 1. TESTE DE CONEXÃO E LEITURA (GET)
// ==========================================
const btnTestar = document.getElementById('btnTestar');
if (btnTestar) {
    btnTestar.addEventListener('click', async () => {
        const resultadoDiv = document.getElementById('resultado');
        resultadoDiv.innerText = "A testar conexão...";
        try {
            const response = await fetch('/api/jogadores');
            const data = await response.json();
            const quantidade = data.length !== undefined ? data.length : 0;
            resultadoDiv.style.color = "green";
            resultadoDiv.innerText = `Conexão bem-sucedida! Jogadores registados na base de dados: ${quantidade}`;
        } catch (error) {
            resultadoDiv.style.color = "red";
            resultadoDiv.innerText = "Erro ao conectar com a API. Verifique o console.";
        }
    });
}

// ==========================================
// 2. CADASTRO DE NOVO JOGADOR (POST)
// ==========================================
const formJogador = document.getElementById('formJogador');
if (formJogador) {
    formJogador.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const nome = document.getElementById('nome').value;
        const posicao = document.getElementById('posicao').value;

        try {
            const response = await fetch('/api/jogadores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, posicao })
            });

            if (response.ok) {
                alert('Craque registado com sucesso!');
                formJogador.reset(); 
                carregarPlantel();   
            } else {
                const erroDetalhado = await response.text();
                alert('Atenção: O servidor respondeu com: \n\n' + erroDetalhado);
            }
        } catch (error) {
            console.error('Erro no POST:', error);
        }
    });
}

// ==========================================
// 3. CARREGAR TABELA (GET)
// ==========================================
async function carregarPlantel() {
    const tbody = document.getElementById('listaJogadores');
    if (!tbody) return;

    try {
        const response = await fetch('/api/jogadores');
        const jogadores = await response.json();
        tbody.innerHTML = ''; 

        if (jogadores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="padding: 8px;">Nenhum jogador no banco ainda.</td></tr>';
            return;
        }

        jogadores.forEach(jogador => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 8px;">${jogador.nome}</td>
                <td style="padding: 8px;">${jogador.posicao}</td>
                <td style="padding: 8px; text-align: center;">
                    <button onclick="removerJogador(${jogador.id})" style="background-color: red; color: white; border: none; padding: 5px 10px; cursor: pointer;">X</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar a tabela:', error);
    }
}

// ==========================================
// 4. REMOVER JOGADOR (DELETE)
// ==========================================
window.removerJogador = async function(id) {
    if (!confirm("Tem a certeza que deseja dar cartão vermelho a este jogador?")) return;
    try {
        const response = await fetch(`/api/jogadores/${id}`, { method: 'DELETE' });
        if (response.ok) {
            carregarPlantel(); 
        } else {
            alert("Erro ao remover o jogador.");
        }
    } catch (error) {
        console.error("Erro no DELETE:", error);
    }
};

// ==========================================
// 5. SORTEIO DE EQUIPAS (COM REGRA DE GOLEIRO)
// ==========================================
const btnSortear = document.getElementById('btnSortear');
if (btnSortear) {
    btnSortear.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/jogadores');
            const jogadores = await response.json();

            if (jogadores.length < 2) {
                alert("Precisas de pelo menos 2 jogadores cadastrados para sortear equipas!");
                return;
            }

            // 1. Separar os goleiros dos jogadores de linha
            const goleiros = jogadores.filter(j => j.posicao === 'Goleiro');
            const linha = jogadores.filter(j => j.posicao !== 'Goleiro');

            // 2. Embaralhar os dois grupos de forma independente
            goleiros.sort(() => Math.random() - 0.5);
            linha.sort(() => Math.random() - 0.5);

            const equipaA = [];
            const equipaB = [];

            // 3. Distribuir os Goleiros (um para cada lado)
            goleiros.forEach((goleiro, index) => {
                if (index % 2 === 0) {
                    equipaA.push(goleiro);
                } else {
                    equipaB.push(goleiro);
                }
            });

            // 4. Distribuir o resto dos jogadores de linha de forma equilibrada
            linha.forEach((jogador) => {
                if (equipaA.length <= equipaB.length) {
                    equipaA.push(jogador);
                } else {
                    equipaB.push(jogador);
                }
            });

            // 5. Mostrar no HTML
            const ulA = document.getElementById('equipaA');
            const ulB = document.getElementById('equipaB');
            
            ulA.innerHTML = ''; 
            ulB.innerHTML = ''; 

            equipaA.forEach(j => {
                // Adicionei um emoji de luva para destacar o goleiro no sorteio!
                const destaque = j.posicao === 'Goleiro' ? '🧤 ' : '';
                ulA.innerHTML += `<li>${destaque}<strong>${j.nome}</strong> <em>(${j.posicao})</em></li>`;
            });
            equipaB.forEach(j => {
                const destaque = j.posicao === 'Goleiro' ? '🧤 ' : '';
                ulB.innerHTML += `<li>${destaque}<strong>${j.nome}</strong> <em>(${j.posicao})</em></li>`;
            });

        } catch (error) {
            console.error('Erro ao sortear:', error);
            alert("Erro ao realizar o sorteio.");
        }
    });
}