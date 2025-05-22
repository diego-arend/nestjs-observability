import { OpenAPIObject } from '@nestjs/swagger';

export function enhanceAuthSwaggerDocs(document: OpenAPIObject): void {
  // Adicionar informações extras às tags
  if (document.tags) {
    const authTag = document.tags.find((tag) => tag.name === 'auth');
    if (authTag) {
      authTag.description = 'API para autenticação e autorização';
    }
  }

  // Aprimorar a documentação dos endpoints
  if (document.paths && document.paths['/auth/login']) {
    if (document.paths['/auth/login'].post) {
      const loginOp = document.paths['/auth/login'].post;
      loginOp.description =
        'Este endpoint realiza a autenticação do usuário através do email e senha, ' +
        'retornando um token JWT para autorização em endpoints protegidos.';
    }
  }

  if (document.paths && document.paths['/auth/profile']) {
    if (document.paths['/auth/profile'].get) {
      const profileOp = document.paths['/auth/profile'].get;
      profileOp.description =
        'Este endpoint retorna informações do perfil do usuário autenticado. ' +
        'É necessário enviar o token JWT no header Authorization.';
    }
  }

  // Adicionar exemplos de esquemas de segurança
  if (document.components && !document.components.securitySchemes) {
    document.components.securitySchemes = {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Digite o token JWT sem o prefixo Bearer.',
      },
    };
  }
}
