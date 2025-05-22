import { OpenAPIObject } from '@nestjs/swagger';
import { ResponseObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Exemplos de respostas para o módulo de autenticação
 */
const AUTH_RESPONSE_EXAMPLES = {
  LOGIN_SUCCESS: {
    access_token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    user: {
      id: 1,
      email: 'joao.silva@exemplo.com',
      name: 'João Silva',
      roles: ['user'],
    },
    expiresIn: 3600,
  },
  USER_PROFILE: {
    id: 1,
    email: 'joao.silva@exemplo.com',
    roles: ['user'],
  },
  UNAUTHORIZED: {
    statusCode: 401,
    message: 'Credenciais inválidas',
    error: 'Unauthorized',
  },
  BAD_REQUEST: {
    statusCode: 400,
    message: [
      'email deve ser um endereço de email válido',
      'password não pode estar vazio',
    ],
    error: 'Bad Request',
  },
  CONFLICT: {
    statusCode: 409,
    message: 'Usuário com email joao.silva@exemplo.com já existe',
    error: 'Conflict',
  },
};

/**
 * Adiciona um exemplo à resposta do Swagger
 */
function addResponseExample(
  response: ResponseObject,
  example: any,
  meta: { summary?: string; description?: string } = {},
): void {
  if (!response.content) {
    response.content = {};
  }

  if (!response.content['application/json']) {
    response.content['application/json'] = {};
  }

  if (!response.content['application/json'].examples) {
    response.content['application/json'].examples = {};
  }

  response.content['application/json'].examples.response = {
    value: example,
    summary: meta.summary || 'Exemplo de resposta',
    description: meta.description || undefined,
  };
}

export function enhanceAuthSwaggerDocs(document: OpenAPIObject): void {
  if (!document.components?.securitySchemes?.bearerAuth) {
    console.warn(
      'Aviso: esquema de segurança bearerAuth não encontrado no documento OpenAPI',
    );
  }

  // Adicionar informações extras às tags
  if (document.tags) {
    const authTag = document.tags.find((tag) => tag.name === 'auth');
    if (authTag) {
      authTag.description =
        'API para autenticação e autorização de usuários na plataforma';
    }
  }

  // Aprimorar o endpoint de login
  if (document.paths && document.paths['/auth/login']) {
    if (document.paths['/auth/login'].post) {
      const loginOp = document.paths['/auth/login'].post;

      // Operação de login
      loginOp.summary = 'Autenticar usuário';
      loginOp.description =
        'Este endpoint realiza a autenticação do usuário através do email e senha, ' +
        'retornando um token JWT para autorização em endpoints protegidos.' +
        '\n\n**Este endpoint é público e não requer autenticação prévia.**';

      // Garantir que não há requisito de segurança para o login
      // Isso irá remover o cadeado
      loginOp.security = [];

      // Response 200 (success)
      if (
        loginOp.responses &&
        loginOp.responses['200'] &&
        !('$ref' in loginOp.responses['200'])
      ) {
        loginOp.responses['200'].description = 'Login realizado com sucesso';
        addResponseExample(
          loginOp.responses['200'],
          AUTH_RESPONSE_EXAMPLES.LOGIN_SUCCESS,
          {
            summary: 'Autenticação bem-sucedida',
            description: 'Retorna o token JWT e informações básicas do usuário',
          },
        );
      }

      // Response 401 (unauthorized)
      if (
        loginOp.responses &&
        loginOp.responses['401'] &&
        !('$ref' in loginOp.responses['401'])
      ) {
        loginOp.responses['401'].description = 'Credenciais inválidas';
        addResponseExample(
          loginOp.responses['401'],
          AUTH_RESPONSE_EXAMPLES.UNAUTHORIZED,
          {
            summary: 'Falha na autenticação',
            description: 'Email ou senha inválidos',
          },
        );
      }

      // Request body examples
      if (loginOp.requestBody && !('$ref' in loginOp.requestBody)) {
        if (
          loginOp.requestBody.content &&
          loginOp.requestBody.content['application/json']
        ) {
          loginOp.requestBody.description = 'Credenciais do usuário';
          loginOp.requestBody.required = true;
          loginOp.requestBody.content['application/json'].examples = {
            validCredentials: {
              summary: 'Credenciais válidas',
              description: 'Exemplo de credenciais válidas para autenticação',
              value: {
                email: 'joao.silva@exemplo.com',
                password: 'Senha@123',
              },
            },
            invalidEmail: {
              summary: 'Email inválido',
              description: 'Exemplo de email em formato inválido',
              value: {
                email: 'email-invalido',
                password: 'Senha@123',
              },
            },
          };
        }
      }
    }
  }

  // Aprimorar o endpoint de signup
  if (document.paths && document.paths['/auth/signup']) {
    if (document.paths['/auth/signup'].post) {
      const signupOp = document.paths['/auth/signup'].post;

      // Operação de signup
      signupOp.summary = 'Registrar novo usuário';
      signupOp.description =
        'Este endpoint permite que novos usuários se registrem na plataforma. ' +
        'Após o registro bem-sucedido, um token JWT é retornado para que o usuário ' +
        'já esteja autenticado após o cadastro, sem necessidade de login separado.' +
        '\n\n**Este endpoint é público e não requer autenticação prévia.**';

      // Garantir que não há requisito de segurança para o signup
      // Isso irá remover o cadeado
      signupOp.security = [];

      // Response 201 (created)
      if (
        signupOp.responses &&
        signupOp.responses['201'] &&
        !('$ref' in signupOp.responses['201'])
      ) {
        signupOp.responses['201'].description =
          'Usuário registrado com sucesso';
        addResponseExample(
          signupOp.responses['201'],
          AUTH_RESPONSE_EXAMPLES.LOGIN_SUCCESS,
          {
            summary: 'Registro bem-sucedido',
            description:
              'Retorna o token JWT e informações básicas do usuário recém-criado',
          },
        );
      }

      // Response 400 (bad request)
      if (
        signupOp.responses &&
        signupOp.responses['400'] &&
        !('$ref' in signupOp.responses['400'])
      ) {
        signupOp.responses['400'].description = 'Dados inválidos fornecidos';
        addResponseExample(
          signupOp.responses['400'],
          AUTH_RESPONSE_EXAMPLES.BAD_REQUEST,
          {
            summary: 'Dados inválidos',
            description: 'Um ou mais campos não passaram na validação',
          },
        );
      }

      // Response 409 (conflict)
      if (
        signupOp.responses &&
        signupOp.responses['409'] &&
        !('$ref' in signupOp.responses['409'])
      ) {
        signupOp.responses['409'].description = 'Email já está em uso';
        addResponseExample(
          signupOp.responses['409'],
          AUTH_RESPONSE_EXAMPLES.CONFLICT,
          {
            summary: 'Email já cadastrado',
            description: 'Um usuário com este email já existe no sistema',
          },
        );
      }

      // Request body examples
      if (signupOp.requestBody && !('$ref' in signupOp.requestBody)) {
        if (
          signupOp.requestBody.content &&
          signupOp.requestBody.content['application/json']
        ) {
          signupOp.requestBody.description = 'Dados do novo usuário';
          signupOp.requestBody.required = true;
          signupOp.requestBody.content['application/json'].examples = {
            validUser: {
              summary: 'Usuário válido',
              description: 'Exemplo de dados válidos para criação de usuário',
              value: {
                name: 'João Silva',
                email: 'joao.silva@exemplo.com',
                password: 'Senha@123',
              },
            },
            invalidData: {
              summary: 'Dados inválidos',
              description: 'Exemplo que gerará erro de validação',
              value: {
                name: 'J', // Nome muito curto
                email: 'email-invalido',
                password: '123', // Senha muito curta
              },
            },
          };
        }
      }
    }
  }

  // Aprimorar o endpoint de profile
  if (document.paths && document.paths['/auth/profile']) {
    if (document.paths['/auth/profile'].get) {
      const profileOp = document.paths['/auth/profile'].get;

      // Operação de profile
      profileOp.summary = 'Obter perfil do usuário';
      profileOp.description =
        'Este endpoint retorna informações do perfil do usuário autenticado. ' +
        'É necessário enviar o token JWT no header Authorization.' +
        '\n\n**Este endpoint requer autenticação JWT.** Use o botão Authorize acima para fornecer seu token JWT.';

      // Manter configuração de segurança para o profile
      profileOp.security = [{ bearerAuth: [] }];

      // Response 200 (success)
      if (
        profileOp.responses &&
        profileOp.responses['200'] &&
        !('$ref' in profileOp.responses['200'])
      ) {
        profileOp.responses['200'].description =
          'Perfil do usuário obtido com sucesso';
        addResponseExample(
          profileOp.responses['200'],
          AUTH_RESPONSE_EXAMPLES.USER_PROFILE,
          {
            summary: 'Dados do perfil',
            description: 'Retorna informações básicas do usuário autenticado',
          },
        );
      }

      // Response 401 (unauthorized)
      if (
        profileOp.responses &&
        profileOp.responses['401'] &&
        !('$ref' in profileOp.responses['401'])
      ) {
        profileOp.responses['401'].description =
          'Não autenticado ou token inválido';
        addResponseExample(
          profileOp.responses['401'],
          AUTH_RESPONSE_EXAMPLES.UNAUTHORIZED,
          {
            summary: 'Não autorizado',
            description: 'Token JWT ausente, expirado ou inválido',
          },
        );
      }
    }
  }
}
