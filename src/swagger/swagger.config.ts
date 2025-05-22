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
    .addBearerAuth()
    .build();

  // Gerar o documento base sem especificar módulos a incluir
  // Desta forma, todos os endpoints são documentados inicialmente
  const document = SwaggerModule.createDocument(app, config);

  // Aprimorar a documentação
  enhanceUsersSwaggerDocs(document);
  enhanceAuthSwaggerDocs(document);

  // Filtrar endpoints não relacionados a usuários
  filterInternalEndpoints(document);

  // Configurar o endpoint do Swagger com opções personalizadas
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
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
 * Remove endpoints que não estão relacionados ao módulo de usuários
 */
function filterInternalEndpoints(document: OpenAPIObject) {
  // Lista de caminhos que não devemos incluir na documentação
  const internalPathsPatterns = ['/health', '/metrics', '/healthcheck'];

  // Remover paths internos
  if (document.paths) {
    Object.keys(document.paths).forEach((path) => {
      if (
        internalPathsPatterns.some((pattern) => path.startsWith(pattern)) ||
        !path.startsWith('/users')
      ) {
        delete document.paths[path];
      }
    });
  }

  // Manter apenas a tag 'users'
  if (document.tags) {
    document.tags = document.tags.filter((tag) => tag.name === 'users');
  }
}
