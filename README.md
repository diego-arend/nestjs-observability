# NestJS Observability

Uma aplicação NestJS demonstrando práticas avançadas de observabilidade com Prometheus, Grafana e OpenTelemetry.

## Detalhes de Arquitetura

### Sistema de Observabilidade

A aplicação implementa uma arquitetura abrangente de observabilidade seguindo os três pilares: métricas, logs e traces. A solução foi projetada para minimizar o código boilerplate nos controllers enquanto mantém coleta consistente de dados.

#### Interceptors Globais

##### MetricsInterceptor

O `MetricsInterceptor` captura métricas globalmente para todas as requisições HTTP:

- **Coleta Automática**: Intercepta todas as requisições que passam pelo NestJS
- **Filtragem Inteligente**: Ignora endpoints de health check e monitoramento via `shouldSkipMonitoring()`
- **Métricas Registradas**:
  - `http_requests_total`: Contador com labels para método, caminho e código de status
  - `http_request_duration_seconds`: Histograma que mede latências de requisições

```typescript
// Incrementa o contador e registra duração para requisições bem-sucedidas
this.requestCounter.inc({ method, path, statusCode });
this.requestDuration.observe({ method, path, statusCode }, duration);
```

##### TraceIdInterceptor

O `TraceIdInterceptor` implementa distributed tracing para rastreabilidade entre serviços:

- **IDs Únicos**: Gera ou reutiliza IDs de trace para cada requisição
- **Propagação**: Inclui o trace ID nos headers de resposta e contexto para logs
- **Correlação**: Permite vincular logs, métricas e spans de uma mesma transação

#### Separação de Responsabilidades

A arquitetura separa claramente as responsabilidades:

1. **Interceptors**: Responsáveis por métricas técnicas e coleta de traces
2. **Controllers**: Focam na lógica de negócio e logs contextuais
3. **Filtros Compartilhados**: Garantem consistência em quais endpoints são monitorados

#### Integração com OpenTelemetry

O sistema de tracing utiliza OpenTelemetry para integração com ferramentas como Jaeger ou Tempo:

- **Auto-instrumentação**: Captura automática de traces para HTTP, Express e NestJS
- **Filtros Customizados**: Configura quais endpoints devem ser rastreados
- **Exportação Configurável**: Envia traces para coletores OTLP (OpenTelemetry Protocol)

#### Abordagem de Logging

Os logs são estruturados e contêm informações contextuais:

```typescript
// Exemplo do UsersController
this.logger.log(`Criando usuário com email: ${createUserDto.email}`);
this.logger.log(`Usuário criado com sucesso: ID=${result.id}`);
```

Estes logs complementam as métricas e traces, fornecendo contexto de negócio que facilita a resolução de problemas.

#### Sistema de Logs com Pino e Integração Loki

A aplicação utiliza o Pino como biblioteca de logging, otimizada para performance e integração com o ecossistema de observabilidade:

- **Centralização dos Logs**: Logs são estruturados em formato JSON e centralizados através do Loki
- **Correlação com Traces**: Todos os logs incluem o `trace_id` automaticamente, permitindo navegar entre logs e traces
- **Níveis Configuráveis**: Configuração de nível de log (`LOG_LEVEL`) por ambiente
- **Contextualização**: Logs incluem metadados como serviço, ambiente, contexto da aplicação e timestamp preciso

##### Níveis de Log

A aplicação implementa uma estratégia consistente de logging com diferentes níveis de severidade:

| Nível   | Uso                                            | Exemplo                                           |
|---------|------------------------------------------------|---------------------------------------------------|
| ERROR   | Falhas críticas que impactam funcionalidades   | Conexão com banco de dados perdida, API externa indisponível |
| WARN    | Situações problemáticas, mas não fatais        | Tentativa de acesso não autorizado, deprecation warnings |
| INFO    | Eventos normais relevantes para operação       | Usuário criado, requisição processada com sucesso |
| DEBUG   | Informações detalhadas para troubleshooting    | Parâmetros de requisição, detalhes de processamento |
| TRACE   | Rastreamento profundo para depuração avançada  | Fluxo detalhado entre funções, valores intermediários |

O nível de log pode ser configurado via variável de ambiente `LOG_LEVEL`, sendo o padrão `info` em produção e `debug` em desenvolvimento. Logs de níveis inferiores ao configurado são automaticamente filtrados.

```typescript
// Exemplo de uso do logger em um serviço
@Injectable()
export class UsersService {
  constructor(private readonly logger: PinoLoggerService) {}

  async create(createUserDto: CreateUserDto) {
    this.logger.log(
      `Criando usuário com email: ${createUserDto.email}`,
      'UsersService',
      { operation: 'create_user' }
    );

    try {
      // Lógica de criação
      return result;
    } catch (error) {
      this.logger.error(
        `Falha ao criar usuário: ${error.message}`,
        error.stack,
        'UsersService',
        { operation: 'create_user', email: createUserDto.email }
      );
      throw error;
    }
  }
}
```

### Estratégia de Documentação com Swagger

O projeto implementa uma abordagem avançada para documentação de API usando Swagger/OpenAPI, com um sistema de "enhancers" que separa a documentação do código do controller, resultando em um código mais limpo e uma documentação mais rica.

#### Arquitetura da Documentação

A documentação é estruturada em três camadas:

1. **Configuração Central do Swagger**: 
   - Um módulo central (`swagger.config.ts`) configura as definições básicas da API
   - Registra o endpoint do Swagger e coordena os enhancers dos módulos

2. **Documentação Modular por Domínio**:
   - Cada módulo possui seu próprio arquivo de documentação (`users.document.ts`)
   - Define constantes reutilizáveis para exemplos, operações e respostas

3. **Enhancers de Documentação**:
   - Arquivos especializados (`users.swagger.enhancer.ts`) que enriquecem dinamicamente a documentação
   - Manipulam o objeto OpenAPI para adicionar exemplos, descrições e metadados detalhados

#### Principais Componentes

##### Configuração Central

```typescript
// swagger.config.ts
export function setupSwagger(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('NestJS Observability API')
    .setDescription('API com monitoramento completo')
    .setVersion('1.0')
    .addTag('users', 'Operações de usuários')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Aprimorar o documento com enhancers de módulos
  enhanceUsersSwaggerDocs(document);
  
  SwaggerModule.setup('api-docs', app, document);
  return document;
}
```

##### Documentação do Módulo

```typescript
// users.document.ts
export const USER_RESPONSE_EXAMPLES = {
  SINGLE_USER: {
    id: 1,
    name: 'João Silva',
    email: 'joao.silva@exemplo.com',
    // ...
  },
  // ...
};

export const USER_API_OPERATIONS = {
  CREATE_USER: {
    summary: 'Criar novo usuário',
    description: 'Cria um novo usuário no sistema com nome e email',
  } as ApiOperationOptions,
  // ...
};
```

##### Enhancer do Módulo

```typescript
// users.swagger.enhancer.ts
export function enhanceUsersSwaggerDocs(document: OpenAPIObject): void {
  if (document.paths['/users'] && document.paths['/users'].post) {
    const postOp = document.paths['/users'].post;
    postOp.summary = USER_API_OPERATIONS.CREATE_USER.summary;
    
    // Adicionar exemplos detalhados de requisição e resposta
    // ...
  }
}
```

#### Benefícios dessa Abordagem

1. **Separação de Preocupações**:
   - Os controllers permanecem limpos e focados na lógica de negócio
   - A documentação detalhada está em arquivos dedicados

2. **Documentação Rica**:
   - Exemplos detalhados de requisições e respostas
   - Descrições específicas para cada endpoint
   - Metadados para diferentes cenários de uso (erros, sucesso, casos especiais)

3. **Manutenibilidade**:
   - A documentação de um módulo fica centralizada, facilitando atualizações
   - Constantes reutilizáveis reduzem duplicação

4. **Facilidade de Extensão**:
   - Novos módulos podem criar seus próprios enhancers
   - A função de enhancer permite personalização avançada da documentação

5. **Tipagem Forte**:
   - Todo o sistema usa TypeScript com tipagem completa
   - Interfaces do OpenAPI garantem consistência

Esta abordagem cria uma documentação Swagger completa e detalhada, oferecendo aos consumidores da API exemplos práticos de uso, descrições claras e informações sobre comportamentos em casos de erro, sem sobrecarregar o código dos controllers.

### Benefícios da Arquitetura

1. **Consistência**: Métricas e traces são coletados uniformemente em toda a aplicação
2. **Baixo Acoplamento**: Controllers não precisam se preocupar com código de instrumentação
3. **Manutenibilidade**: Mudanças nos requisitos de observabilidade podem ser implementadas centralmente
4. **Correlação**: Fácil correlação entre requisições, logs e métricas

### Dashboards e Visualização

A observabilidade é complementada por dashboards configurados no Grafana:

- **Métricas HTTP**: Taxas de requisições, latências e códigos de status
- **Estatísticas de Aplicação**: Uso de memória, CPU e métricas específicas de negócio
- **Exploração de Traces**: Visualização de traces distribuídos para análise de performance

##### Exploração de Logs no Grafana

O sistema permite consultas poderosas no Grafana usando a linguagem LogQL:

- Filtrar por contexto: `{app="nestjs-observability"} |= "UsersService"`
- Buscar erros: `{app="nestjs-observability", level="error"}`
- Trace de uma requisição: `{app="nestjs-observability"} |= "trace_id=abcdef123456"`
- Extrair e agregar: `sum(count_over_time({app="nestjs-observability", level="error"}[5m])) by (error_type)`

##### Correlação Logs-Traces

Ao clicar em um log no Grafana que contém um `trace_id`, é possível navegar diretamente para o trace completo da requisição no Tempo, proporcionando uma experiência fluida de análise e troubleshooting.

#### Tratamento Padronizado de Exceções

A aplicação implementa um sistema robusto para tratamento de exceções através do `HttpExceptionFilter`, que diferencia claramente entre exceções HTTP esperadas (parte normal do fluxo da API) e erros reais de aplicação (bugs ou falhas de sistema).

##### HttpExceptionFilter

O filtro global de exceções garante respostas consistentes e padronizadas para todas as situações de erro:

- **Diferenciação de Erros**: Distingue entre exceções HTTP esperadas e erros reais da aplicação
- **Propagação para Traces**: Adiciona informações de erro aos traces de forma contextualizada
- **Logging Inteligente**: Registra logs com níveis de severidade apropriados para cada tipo de erro

```typescript
// Exemplo de diferenciação entre exceções HTTP e erros de sistema
if (!isHttpException || status >= 500) {
  // ERRO REAL: Registrar como erro no trace e nos logs
  this.addErrorToTrace(exception, request.path, status);
  this.logApplicationError(exception, request, status);
} else {
  // EXCEÇÃO HTTP: Registrar como evento normal no trace e log info/debug
  this.addExceptionEventToTrace(exception, request.path, status);
  this.logHttpException(exception, request, status);
}
```

##### Categorias de Erro

O sistema faz uma clara distinção entre dois tipos de situações excepcionais:

1. **Exceções HTTP Esperadas (4xx)**:
   - Validações de input (400)
   - Recursos não encontrados (404)
   - Conflitos de dados (409)
   - Problemas de autenticação/autorização (401/403)
   - Tratadas como parte normal da operação da API
   - Registradas como eventos nos traces, não como erros
   - Logadas com níveis INFO ou DEBUG (exceto 401/403 que são WARN)

2. **Erros Reais de Aplicação**:
   - Exceções não-HTTP (bugs, erros de programação)
   - Erros de servidor (status 5xx)
   - Falhas de infraestrutura ou dependências
   - Registrados como erros genuínos nos traces
   - Sempre logados com nível ERROR e stack trace completo

##### Exceções Personalizadas

A aplicação utiliza exceções personalizadas que estendem as classes base do NestJS:

```typescript
// Exemplo de exceção personalizada para 404
export class NotFoundException extends CustomHttpException {
  constructor(
    entityName: string, 
    identifier?: string | number, 
    public readonly details?: any
  ) {
    const message = identifier
      ? `${entityName} com identificador ${identifier} não encontrado(a)`
      : `${entityName} não encontrado(a)`;
    super(message, HttpStatus.NOT_FOUND);
  }
}
```

Estas classes proporcionam:
- Mensagens padronizadas para cada tipo de erro
- Suporte para detalhes adicionais
- Integração com o sistema de filtro de exceções

##### Benefícios dessa Abordagem

1. **Métricas Precisas**: Erros reais de sistema são contabilizados separadamente de respostas de erro normais (4xx)
2. **Alertas Relevantes**: Alertas podem ser configurados apenas para erros genuínos, evitando falsos positivos
3. **Debugging Eficiente**: Stack traces completos apenas para erros reais, reduzindo ruído nos logs
4. **Respostas Consistentes**: Todas as respostas de erro seguem o mesmo formato padronizado
5. **Rastreabilidade**: Erros críticos são facilmente rastreáveis nos sistemas de observabilidade

Esta abordagem de tratamento de exceções complementa os interceptors de métricas e traces, garantindo que a observabilidade da aplicação seja abrangente e contextualizada tanto para fluxos normais quanto para situações de erro.


