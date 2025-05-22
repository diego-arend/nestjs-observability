import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { enhanceUsersSwaggerDocs } from '../modules/users/documentation/users.swagger.enhancer';
import { enhanceAuthSwaggerDocs } from '../modules/auth/documentation/auth.swagger.enhancer';

/**
 * Configura o Swagger para a aplicação NestJS
 *
 * @param app Instância da aplicação NestJS
 * @returns Objeto OpenAPI com a documentação completa
 */
export function setupSwagger(app: INestApplication): OpenAPIObject {
  // Configuração básica do Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Gerenciamento de Usuários')
    .setDescription(
      'API para criação, consulta, autenticação e autorização de usuários',
    )
    .setVersion('1.0')
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('auth', 'Autenticação e autorização')
    // Defina apenas uma vez o esquema de segurança aqui
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Digite o token JWT sem o prefixo Bearer.',
        in: 'header',
      },
      'bearerAuth', // Este é o nome do esquema que será referenciado
    )
    .build();

  // Gerar o documento base sem especificar módulos a incluir
  const document = SwaggerModule.createDocument(app, config);

  // Importante: Remover esquemas de segurança duplicados antes de aprimorar a documentação
  ensureSingleSecurityScheme(document);

  // Aprimorar a documentação
  enhanceUsersSwaggerDocs(document);
  enhanceAuthSwaggerDocs(document);

  // Filtrar endpoints internos, mantendo users e auth
  filterInternalEndpoints(document);

  // Configurar o endpoint do Swagger com opções personalizadas
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });

  return document;
}

/**
 * Garante que exista apenas um esquema de segurança do tipo bearer no documento
 */
function ensureSingleSecurityScheme(document: OpenAPIObject): void {
  if (!document.components) {
    document.components = {};
  }

  if (!document.components.securitySchemes) {
    document.components.securitySchemes = {};
  }

  // Garantir que existe apenas o esquema 'bearerAuth' para autenticação JWT
  if (document.components.securitySchemes.bearerAuth) {
    // Remover quaisquer outros esquemas de segurança do tipo Bearer
    Object.keys(document.components.securitySchemes).forEach((key) => {
      const scheme = document.components.securitySchemes[key];

      // Verificar se não é uma referência e se é um esquema Bearer HTTP
      if (
        key !== 'bearerAuth' &&
        !('$ref' in scheme) && // Verificar se não é uma referência
        scheme.type === 'http' &&
        scheme.scheme === 'bearer'
      ) {
        delete document.components.securitySchemes[key];
      }
    });
  }
}

/**
 * Remove endpoints que não estão relacionados aos módulos principais
 */
function filterInternalEndpoints(document: OpenAPIObject) {
  // Lista de caminhos que não devemos incluir na documentação
  const internalPathsPatterns = ['/health', '/metrics', '/healthcheck'];

  // Lista de prefixos de caminhos que queremos manter
  const allowedPrefixes = ['/users', '/auth'];

  // Remover paths internos
  if (document.paths) {
    Object.keys(document.paths).forEach((path) => {
      // Verificar se é um caminho interno ou não começa com um prefixo permitido
      if (
        internalPathsPatterns.some((pattern) => path.startsWith(pattern)) ||
        !allowedPrefixes.some((prefix) => path.startsWith(prefix))
      ) {
        delete document.paths[path];
      }
    });
  }

  // Manter apenas tags relevantes
  if (document.tags) {
    document.tags = document.tags.filter((tag) =>
      ['users', 'auth'].includes(tag.name),
    );
  }
}
