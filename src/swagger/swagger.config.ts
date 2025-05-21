import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { enhanceUsersSwaggerDocs } from '../modules/users/documentation/users.swagger.enhancer';

/**
 * Configura o Swagger para a aplicação NestJS
 *
 * @param app Instância da aplicação NestJS
 * @returns Objeto OpenAPI com a documentação completa
 */
export function setupSwagger(app: INestApplication): OpenAPIObject {
  // Configuração básica do Swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS Observability API')
    .setDescription(
      'API com monitoramento completo: Prometheus, Grafana e Tempo',
    )
    .setVersion('1.0')
    .addTag('metrics', 'Endpoints relacionados a métricas e observabilidade')
    .addTag('users', 'Operações de usuários')
    .addBearerAuth()
    .build();

  // Gerar o documento base
  const document = SwaggerModule.createDocument(app, config);

  // Aprimorar a documentação com informações específicas dos módulos
  enhanceUsersSwaggerDocs(document);

  // Configurar o endpoint do Swagger
  SwaggerModule.setup('api-docs', app, document);

  return document;
}
