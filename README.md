# NestJS com Monitoramento Completo: Prometheus, Grafana e Tempo

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Descrição

Este projeto demonstra a implementação de um sistema completo de observabilidade utilizando NestJS como framework base, integrado com Prometheus para métricas, Grafana para visualização e Tempo para tracing distribuído.

A aplicação possui:
- Endpoints REST para demonstração de funcionalidades
- Integração com PostgreSQL para armazenamento de dados
- Sistema completo de métricas e logs
- Tracing distribuído para visualização de operações end-to-end
- Dashboard customizado para monitoramento em tempo real

## Recursos Principais

- **API RESTful**: Construída com NestJS para alta performance e modularidade
- **Métricas com Prometheus**: Coleta automática de métricas de performance 
- **Visualização com Grafana**: Dashboards personalizados para monitoramento
- **Tracing com Tempo**: Visualização detalhada do fluxo de requisições
- **Persistência com PostgreSQL**: Armazenamento de dados em banco relacional

## Estrutura do Projeto

- `/src`: Código-fonte da aplicação NestJS
- `/grafana`: Configurações e dashboards do Grafana
- `/prometheus`: Configuração do Prometheus
- `/tempo`: Configuração do Tempo para tracing
- `/http_docs`: Documentação das chamadas HTTP para teste

## Monitoramento e Observabilidade

### Métricas (Prometheus)
O projeto coleta automaticamente métricas como:
- Contador de requisições HTTP por endpoint e código de status
- Duração de requisições HTTP
- Eventos personalizados da aplicação
- Contador de erros por tipo
- Métricas do sistema operacional e runtime Node.js

### Visualização (Grafana)
Dashboards customizados para visualização de:
- Taxa de requisições por minuto
- Tempo de resposta (percentil 95)
- Contagem de erros por tipo
- Eventos de sucesso da aplicação
- Saúde geral do sistema

### Tracing Distribuído (Tempo)
Rastreamento detalhado de operações, permitindo visualizar:
- Fluxo completo de requisições desde o frontend até o banco de dados
- Duração precisa de cada operação
- Detalhamento de consultas SQL
- Identificação de gargalos de performance

## Endpoints Disponíveis

- `GET /`: Hello World e métricas básicas
- `GET /error-demo`: Simula e registra erros para demonstração de métricas
- `GET /event-demo`: Registra eventos personalizados
- `GET /metrics`: Retorna todas as métricas coletadas (Prometheus)
- `POST /users`: Cria um novo usuário (integração com PostgreSQL)
- `GET /users`: Lista todos os usuários
- `GET /users/:id`: Busca um usuário específico

## Configuração e Execução

### Pré-requisitos
- Docker e Docker Compose
- Node.js 16+ (para desenvolvimento local)
- NPM ou Yarn

### Instalação

```bash
# Clonar o repositório
git clone <repositório>

# Instalar dependências
npm install
```

### Executando com Docker Compose

```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

### Acessando os Serviços

| Serviço     | URL                      | Credenciais      |
|-------------|--------------------------|------------------|
| NestJS API  | http://localhost:3001    | N/A              |
| Prometheus  | http://localhost:9090    | N/A              |
| Grafana     | http://localhost:3030    | admin/admin      |
| Tempo       | http://localhost:3200    | N/A              |
| PostgreSQL  | localhost:5432           | postgres/postgres|

## Testando a Aplicação

Utilize o arquivo de requisições HTTP localizado em `http_docs/app.http` para testar os endpoints da aplicação. Execute várias chamadas para gerar dados significativos nos dashboards de monitoramento.

## Utilizando o Tempo com Grafana

O Tempo é uma solução de tracing distribuído que permite visualizar o fluxo completo de requisições na sua aplicação. Para utilizá-lo com o Grafana:

### 1. Gerando Dados de Trace

Primeiro, gere dados de trace executando chamadas à API:

```http
### Rota principal - Hello World
GET http://localhost:3001/

### Rota para simular erros e coletar métricas de erros
GET http://localhost:3001/error-demo

### Rota para registrar eventos personalizados
GET http://localhost:3001/event-demo

### Criar um usuário (interagirá com PostgreSQL)
POST http://localhost:3001/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}

### Listar todos os usuários (interagirá com PostgreSQL)
GET http://localhost:3001/users
```

### 2. Acessando Traces no Grafana

1. Acesse o Grafana em http://localhost:3030
2. Faça login com as credenciais (admin/admin)
3. Clique em "Explore" no menu lateral
4. Selecione "Tempo" como fonte de dados no menu suspenso
5. Utilize os filtros de pesquisa:
   - **Serviço**: `nest-app`
   - **Operação**: Selecione uma operação como `/users`, `/` ou `/error-demo`
   - **Tags**: Filtre por tags específicas como `http.method:GET`
   - **Duração**: Filtre por tempo de execução, ex: `> 100ms`
   - **Intervalo de tempo**: Selecione o período para analisar

6. Clique em "Run Query" para buscar as traces disponíveis

### 3. Analisando uma Trace

Ao clicar em uma trace específica, você verá:

1. **Visualização de Timeline**:
   - Mostra a sequência e duração de cada span na trace
   - Spans são coloridos por serviço/componente
   - A largura indica o tempo de execução relativo

2. **Detalhes do Span**:
   - Clique em qualquer span para ver detalhes
   - Examine atributos como `http.method`, `http.status_code`, `db.statement`
   - Veja eventos associados ao span

3. **Gráfico de Nós (Node Graph)**:
   - Visualize as relações entre serviços
   - Identifique dependências e fluxos de comunicação

4. **Flame Graph**:
   - Visualização hierárquica da trace
   - Facilita a identificação de gargalos de performance

### 4. Utilizando o Dashboard Personalizado

Nossa aplicação inclui um dashboard personalizado no Grafana para visualização de métricas e traces:

1. No menu lateral, clique em "Dashboards"
2. Procure por "NestJS Application Metrics"
3. Este dashboard contém:
   - Taxa de requisições por minuto
   - Duração de requisições (percentil 95)
   - Total de erros e eventos
   - Distribuição de erros por tipo
   - Panel de tracing integrado

4. Para acessar o tracing a partir do dashboard:
   - Clique em qualquer ponto dos gráficos de requisições
   - Use a opção "Explore" no menu de contexto
   - Selecione "Tempo" como fonte de dados para ver as traces relacionadas

### 5. Correlacionando Métricas e Traces

Um dos recursos mais poderosos é a capacidade de correlacionar métricas e traces:

1. Ao identificar um pico de latência ou erro no dashboard
2. Clique no ponto específico do gráfico
3. Use "Explore" com fonte de dados "Tempo"
4. Busque traces no mesmo intervalo de tempo
5. Examine as traces para identificar a causa raiz do problema

## Desenvolvimento Local

```bash
# Modo de desenvolvimento
npm run start:dev

# Compilar o projeto
npm run build

# Executar versão compilada
npm run start:prod
```

## Recursos Adicionais

- [Documentação do NestJS](https://docs.nestjs.com)
- [Documentação do Prometheus](https://prometheus.io/docs/)
- [Documentação do Grafana](https://grafana.com/docs/)
- [Documentação do Tempo](https://grafana.com/docs/tempo/latest/)

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.
