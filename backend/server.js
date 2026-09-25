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

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});