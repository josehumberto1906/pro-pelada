# ⚽ Pró-Pelada | Management Pro

O **Pró-Pelada** é uma aplicação web completa, desenvolvida para modernizar e profissionalizar a gestão de partidas de futebol amador (a famosa "pelada"). 
O sistema permite gerir o plantel de jogadores e realizar sorteios inteligentes com um clique, apresentando uma interface de nível empresarial baseada em dashboards modernos.

## ✨ Funcionalidades

- **Arquitetura SPA (Single Page Application):** Navegação fluida entre ecrãs (Visão Geral, Sorteio, Financeiro) sem recarregamento da página.
- **Gestão do Plantel:** Cadastro de novos jogadores com definição obrigatória de posição (Goleiro, Zagueiro, Lateral, Volante, Meio-Campo, Atacante).
- **Listagem em Tempo Real:** Visualização dinâmica dos jogadores confirmados para a partida.
- **Cartão Vermelho (Exclusão):** Remoção de jogadores da base de dados através de modais interativos de confirmação.
- **Sorteio Inteligente com "IA":** Algoritmo de divisão de equipas (Time A e Time B) que identifica automaticamente os Goleiros, distribuindo-os uniformemente e equilibrando o restante dos jogadores de linha.

## 🛠️ Tecnologias e Bibliotecas (Stack)

O projeto foi construído utilizando uma arquitetura moderna, dividida em microserviços e totalmente containerizada, aplicando as melhores bibliotecas do mercado:

### Front-end (Interface e Interação)
- **HTML5, CSS3 & Vanilla JavaScript**
- **Navigo (Router):** Responsável pelo roteamento no lado do cliente (Client-side routing), garantindo a navegação no formato Single Page Application.
- **Axios:** Biblioteca de requisições HTTP baseada em *Promises*, substituindo o fetch nativo para uma comunicação mais limpa e robusta com a API.
- **SweetAlert2:** Substituição dos alertas nativos do navegador por modais altamente responsivos, elegantes e personalizáveis.
- **Canvas-Confetti:** Micro-biblioteca gráfica para gerar *feedback* visual imersivo (efeito de festa) após o processamento do sorteio das equipas.

### Back-end & Base de Dados
- **Node.js:** Ambiente de execução JavaScript no servidor.
- **Express.js (Framework):** Criação da API RESTful e gestão das rotas de *backend*.
- **PostgreSQL:** Sistema de Gestão de Base de Dados Relacional (SGBDR).
- **Prisma ORM:** *Object-Relational Mapper* utilizado para modelagem da base de dados (`schema.prisma`), migrações automáticas e consultas seguras sem necessidade de escrever SQL cru.

### Infraestrutura & DevOps
- **Docker:** Criação de contentores isolados para cada serviço.
- **Docker Compose:** Orquestração simultânea dos serviços (App Node, BD Postgres e Servidor Web).
- **Nginx:** Servidor Web e Proxy Reverso de alta performance, responsável por servir os ficheiros estáticos e encaminhar (proxy pass) as chamadas da API para o contentor Node.js.

## 🚀 Como correr o projeto localmente

### Pré-requisitos
- Ter o [Docker](https://www.docker.com/) e o Docker Compose instalados.

### Passos de Instalação

1. Clone este repositório:
   ```bash
   git clone [https://github.com/josehumberto1906/pro-pelada.git](https://github.com/josehumberto1906/pro-pelada.git)