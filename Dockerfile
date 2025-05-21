# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar ferramentas necessárias para a build
RUN apk add --no-cache wget bash curl

# Instalar PNPM globalmente
RUN npm install -g pnpm@latest

# Copiar arquivos de configuração primeiro (melhor para cache)
COPY package.json pnpm-lock.yaml* tsconfig*.json ./

# Instalar todas as dependências (incluindo devDependencies)
RUN pnpm install --frozen-lockfile

# Copiar código fonte 
COPY . .

# Compilar o projeto
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

# Adicionar usuário não-root para mais segurança
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Instalar PNPM globalmente
RUN npm install -g pnpm@latest

# Copiar apenas arquivos necessários para produção
COPY --from=builder /app/package.json /app/pnpm-lock.yaml* ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Instalação apenas de dependências de produção, mais leve
RUN pnpm install --prod --frozen-lockfile

# Criar diretório necessário para OpenTelemetry
RUN mkdir -p /tmp/tempo && chown -R appuser:appgroup /tmp/tempo

# Configurações de segurança
USER appuser

# Definir variáveis de ambiente para produção
ENV NODE_ENV=production
ENV PORT=3001

# Verificação de saúde
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3005}/health || exit 1

# Expor a porta da aplicação
EXPOSE ${PORT:-3005}

# Iniciar o aplicativo com ponto de entrada direto do Node.js
CMD ["node", "dist/main.js"]