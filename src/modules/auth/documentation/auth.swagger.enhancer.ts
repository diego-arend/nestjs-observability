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

  if (document.paths && document.paths['/auth/signup']) {
    if (document.paths['/auth/signup'].post) {
      const signupOp = document.paths['/auth/signup'].post;
      signupOp.description =
        'Este endpoint permite que novos usuários se registrem na plataforma. ' +
        'Após o registro bem-sucedido, um token JWT é retornado para que o usuário ' +
        'já esteja autenticado após o cadastro, sem necessidade de login separado.';
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
