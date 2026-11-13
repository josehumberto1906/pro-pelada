const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// ==========================================
// ROTAS DE JOGADORES (O Plantel)
// ==========================================

// Rota GET - Listar jogadores
app.get('/api/jogadores', async (req, res) => {
    try {
        const jogadores = await prisma.jogador.findMany();
        res.json(jogadores);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar jogadores", detalhes: error.message });
    }
});

// Rota POST - Criar jogador
app.post('/api/jogadores', async (req, res) => {
    try {
        const { nome, posicao } = req.body;
        const novoJogador = await prisma.jogador.create({
            data: { nome, posicao }
        });
        res.status(201).json(novoJogador);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao criar jogador", detalhes: error.message });
    }
});

// Rota DELETE - Remover jogador
app.delete('/api/jogadores/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.jogador.delete({
            where: { id: id }
        });
        res.status(200).json({ mensagem: "Jogador expulso de campo!" });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao remover jogador", detalhes: error.message });
    }
});

// ==========================================
// ROTAS DE PARTIDAS (O Jogo da Semana)
// ==========================================

// Criar uma nova partida
app.post('/api/partidas', async (req, res) => {
  try {
    const { custoTotal, status } = req.body;
    const partida = await prisma.partida.create({
      data: { custoTotal, status }
    });
    res.status(201).json(partida);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar partida no Gestão 4ssss' });
  }
});

// Listar todas as partidas
app.get('/api/partidas', async (req, res) => {
  try {
    const partidas = await prisma.partida.findMany();
    res.json(partidas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar partidas' });
  }
});

// ==========================================
// ROTAS FINANCEIRAS (Pagamentos)
// ==========================================

// Registar o pagamento de um jogador
app.post('/api/pagamentos', async (req, res) => {
  try {
    const { valor, metodo, status, jogadorId, partidaId } = req.body;
    
    const pagamento = await prisma.pagamento.create({
      data: { 
        valor: parseFloat(valor), 
        metodo, 
        status, 
        jogadorId: parseInt(jogadorId), 
        partidaId: parseInt(partidaId) 
      }
    });
    res.status(201).json(pagamento);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registar pagamento' });
  }
});

// ==========================================
// ROTAS DE ESTATÍSTICAS (Golos e Cartões)
// ==========================================

// Registar desempenho de um jogador numa partida
app.post('/api/estatisticas', async (req, res) => {
  try {
    const { gols, assistencias, cartoesAmarelos, cartaoVermelho, jogadorId, partidaId } = req.body;
    
    const estatistica = await prisma.estatistica.create({
      data: {
        gols: parseInt(gols || 0),
        assistencias: parseInt(assistencias || 0),
        cartoesAmarelos: parseInt(cartoesAmarelos || 0),
        cartaoVermelho: Boolean(cartaoVermelho),
        jogadorId: parseInt(jogadorId),
        partidaId: parseInt(partidaId)
      }
    });
    res.status(201).json(estatistica);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registar estatísticas' });
  }
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log(`Servidor do Gestão 4ssss rodando na porta ${PORT}`);
});