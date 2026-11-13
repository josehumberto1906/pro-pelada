FROM node:20-alpine

# 1. Instalar o OpenSSL (Resolve o aviso do libssl)
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY package*.json ./

# 2. Instalar os pacotes e FORÇAR o Prisma 5 em todo o lado
RUN npm install
RUN npm install prisma@5 @prisma/client@5

COPY . .

# 3. Gerar o cliente limpo
RUN npx prisma generate

EXPOSE 3000

# (Se houver uma linha CMD aqui no final do seu ficheiro original, mantenha-a!)
CMD ["npm", "start"]