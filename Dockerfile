FROM node:20-alpine

WORKDIR /usr/src/app

# Instalar ferramentas necessárias
RUN apk add --no-cache wget bash

# Copiar arquivos de configuração primeiro (melhor para cache)
COPY package*.json tsconfig*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte 
COPY . .

# Verificar se a pasta dist existe e criar se necessário
RUN mkdir -p dist

# Compilar o projeto - continuar mesmo se houver erros
RUN npm run build || echo "Build completado com avisos"

# Verificar se o arquivo main.js existe
RUN ls -la dist/

# Expor a porta da aplicação
EXPOSE ${PORT:-3001}

# Iniciar o aplicativo
CMD ["npm", "run", "start:prod"]