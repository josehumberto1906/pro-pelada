# ⚽ Pró-Pelada | Management Pro

O **Pró-Pelada** é uma aplicação web completa, desenvolvida para modernizar e profissionalizar a gestão de partidas de futebol amador (a famosa "pelada"). 
Adeus à confusão de dividir os times na hora do jogo: o sistema permite gerir o plantel de jogadores e realizar sorteios inteligentes com um clique.

## ✨ Funcionalidades

- **Gestão do Plantel:** Cadastro de novos jogadores com definição obrigatória de posição (Goleiro, Zagueiro, Lateral, Volante, Meio-Campo, Atacante).
- **Listagem em Tempo Real:** Visualização dinâmica dos jogadores confirmados para a partida.
- **Cartão Vermelho (Exclusão):** Remoção de jogadores da base de dados de forma simples e rápida.
- **Sorteio Inteligente com "IA":** Algoritmo de divisão de equipas (Time A e Time B) que identifica automaticamente os Goleiros, distribuindo-os uniformemente (um para cada lado) e equilibrando o restante dos jogadores de linha.
- **Interface Moderna:** Design responsivo, limpo e profissional, inspirado em dashboards de gestão desportiva.

## 🛠️ Tecnologias e Infraestrutura (Stack)

O projeto foi construído utilizando uma arquitetura moderna e totalmente containerizada:

- **Front-end:** HTML5, CSS3, Vanilla JavaScript (Servido através de Nginx).
- **Back-end:** Node.js com Express.js.
- **Base de Dados:** PostgreSQL.
- **ORM:** Prisma (Prisma Client & Prisma Migrate).
- **Infraestrutura:** Docker e Docker Compose (Orquestração de múltiplos contentores: API, Banco de Dados e Servidor Web Nginx).

## 🚀 Como correr o projeto localmente

Como o projeto está 100% configurado em Docker, iniciá-lo em qualquer máquina é extremamente simples.

### Pré-requisitos
- Ter o [Docker](https://www.docker.com/) e o Docker Compose instalados.

### Passos de Instalação

1. Clone este repositório:
   ```bash
   git clone [https://github.com/josehumberto1906/pro-pelada.git](https://github.com/josehumberto1906/pro-pelada.git)