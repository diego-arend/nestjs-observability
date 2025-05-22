import { OpenAPIObject, ApiOperationOptions } from '@nestjs/swagger';
import {
  ResponseObject,
  OperationObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Exemplos de respostas de sucesso para o módulo de usuários
 */
const USER_RESPONSE_EXAMPLES = {
  SINGLE_USER: {
    id: 1,
    name: 'João Silva',
    email: 'joao.silva@exemplo.com',
    createdAt: '2025-05-21T10:00:00.000Z',
    updatedAt: '2025-05-21T10:00:00.000Z',
    // Password não é incluído na resposta por segurança
  },
  USER_LIST: [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@exemplo.com',
      createdAt: '2025-05-21T10:00:00.000Z',
      updatedAt: '2025-05-21T10:00:00.000Z',
      // Password não é incluído na resposta por segurança
    },
    {
      id: 2,
      name: 'Maria Souza',
      email: 'maria.souza@exemplo.com',
      createdAt: '2025-05-21T11:00:00.000Z',
      updatedAt: '2025-05-21T11:00:00.000Z',
      // Password não é incluído na resposta por segurança
    },
  ],
  CREATE_USER_REQUEST: {
    name: 'João Silva',
    email: 'joao.silva@exemplo.com',
    password: 'Senha@123',
  },
  UPDATE_USER_REQUEST: {
    name: 'João Silva Atualizado',
    email: 'joao.silva.novo@exemplo.com',
    password: 'NovaSenha@123',
  },
  PARTIAL_UPDATE_REQUEST: {
    name: 'João Silva Atualizado',
  },
};

/**
 * Exemplos de erros para o módulo de usuários
 */
const USER_ERROR_EXAMPLES = {
  CONFLICT: {
    statusCode: 409,
    message: 'Usuário com email joao.silva@exemplo.com já existe',
    error: 'Conflict',
  },
  NOT_FOUND: {
    statusCode: 404,
    message: 'Usuário com ID 999 não encontrado',
    error: 'Not Found',
  },
  VALIDATION_ERROR: {
    statusCode: 400,
    message: [
      'email deve ser um endereço de email válido',
      'name não deve estar vazio',
      'password deve conter pelo menos 8 caracteres',
      'password deve incluir letras maiúsculas, minúsculas e números',
    ],
    error: 'Bad Request',
  },
  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    message: 'Erro ao criar usuário',
    error: 'Internal Server Error',
  },
  UNAUTHORIZED: {
    statusCode: 401,
    message: 'Unauthorized',
    error: 'Você não está autenticado para acessar este recurso',
  },
};

/**
 * Documentação das operações do controller de usuários
 */
const USER_API_OPERATIONS = {
  CREATE_USER: {
    summary: 'Criar novo usuário',
    description: 'Cria um novo usuário no sistema com nome, email e senha',
  } as ApiOperationOptions,
  FIND_ALL: {
    summary: 'Listar todos os usuários',
    description:
      'Retorna a lista completa de usuários cadastrados no sistema (sem incluir senhas)',
  } as ApiOperationOptions,
  FIND_ONE: {
    summary: 'Buscar usuário por ID',
    description:
      'Localiza e retorna os dados de um usuário específico pelo seu ID (sem incluir a senha)',
  } as ApiOperationOptions,
  UPDATE_USER: {
    summary: 'Atualizar usuário existente',
    description:
      'Atualiza os dados de um usuário existente com base no ID fornecido. A senha, se fornecida, será hasheada automaticamente.',
  } as ApiOperationOptions,
};

/**
 * Aprimora uma operação com informações consistentes
 */
function enhanceOperation(
  operation: OperationObject,
  apiOpOptions: ApiOperationOptions,
): void {
  operation.summary = apiOpOptions.summary;
  operation.description = apiOpOptions.description;

  // Adicionar tags adicionais se necessário
  if (!operation.tags || operation.tags.length === 0) {
    operation.tags = ['users'];
  }
}

/**
 * Melhora a descrição do parâmetro ID
 */
function enhanceIdParameter(operation: OperationObject): void {
  if (operation.parameters && operation.parameters.length > 0) {
    const idParam = operation.parameters.find(
      (p) => !('$ref' in p) && p.name === 'id',
    );
    if (idParam && !('$ref' in idParam)) {
      idParam.description = 'ID numérico único do usuário';
      idParam.example = 1;
      idParam.required = true;
      idParam.schema = {
        type: 'integer',
        format: 'int32',
        minimum: 1,
      };
    }
  }
}

/**
 * Adiciona exemplos detalhados para o body de atualização
 */
function enhanceUpdateRequestBody(operation: OperationObject): void {
  if (operation.requestBody && !('$ref' in operation.requestBody)) {
    if (
      operation.requestBody.content &&
      operation.requestBody.content['application/json']
    ) {
      operation.requestBody.description =
        'Dados do usuário a serem atualizados';
      operation.requestBody.required = true;
      operation.requestBody.content['application/json'].examples = {
        fullUpdate: {
          summary: 'Atualização completa',
          description: 'Atualiza todos os campos do usuário',
          value: USER_RESPONSE_EXAMPLES.UPDATE_USER_REQUEST,
        },
        partialUpdate: {
          summary: 'Atualização parcial (apenas nome)',
          description:
            'Atualiza apenas o nome do usuário, mantendo o email e senha',
          value: USER_RESPONSE_EXAMPLES.PARTIAL_UPDATE_REQUEST,
        },
        passwordUpdate: {
          summary: 'Atualização apenas da senha',
          description: 'Atualiza apenas a senha do usuário',
          value: {
            password: 'NovaSenha@123',
          },
        },
      };
    }
  }
}

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

/**
 * Adiciona documentação avançada para os endpoints de usuários
 */
export function enhanceUsersSwaggerDocs(document: OpenAPIObject): void {
  if (!document.paths) return;

  // Adicionar informações extras às tags
  if (document.tags) {
    const usersTag = document.tags.find((tag) => tag.name === 'users');
    if (usersTag) {
      usersTag.description =
        'API para gerenciamento de usuários no sistema. Todos os endpoints requerem autenticação JWT.';
    }
  }

  // Aprimorar o endpoint POST /users
  if (document.paths['/users']) {
    // Adicionar exemplos detalhados para POST
    if (document.paths['/users'].post) {
      const postOp = document.paths['/users'].post;
      enhanceOperation(postOp, USER_API_OPERATIONS.CREATE_USER);
      postOp.description +=
        '\n\nEste endpoint cria um novo usuário com nome, email e senha. A senha será armazenada de forma segura (hasheada) e nunca será retornada nas respostas.' +
        '\n\n**Este endpoint requer autenticação JWT.** Use o botão Authorize acima para fornecer seu token JWT.';

      // Adicionar requisito de autenticação
      postOp.security = [{ bearerAuth: [] }];

      // Adicionar exemplo de request body
      if (postOp.requestBody && !('$ref' in postOp.requestBody)) {
        if (
          postOp.requestBody.content &&
          postOp.requestBody.content['application/json']
        ) {
          postOp.requestBody.description = 'Dados do usuário a ser criado';
          postOp.requestBody.required = true;
          postOp.requestBody.content['application/json'].examples = {
            validUser: {
              summary: 'Usuário válido',
              description: 'Exemplo de dados válidos para criação de usuário',
              value: USER_RESPONSE_EXAMPLES.CREATE_USER_REQUEST,
            },
            invalidUser: {
              summary: 'Usuário inválido (email incorreto)',
              description: 'Este exemplo irá gerar um erro de validação',
              value: {
                name: 'João Silva',
                email: 'email-invalido',
                password: '123', // Senha muito curta
              },
            },
          };
        }
      }

      // Adicionar exemplos de resposta para o endpoint POST
      if (
        postOp.responses &&
        postOp.responses['201'] &&
        !('$ref' in postOp.responses['201'])
      ) {
        addResponseExample(
          postOp.responses['201'],
          USER_RESPONSE_EXAMPLES.SINGLE_USER,
          {
            summary: 'Usuário criado com sucesso',
            description: 'Retorna o usuário recém-criado (sem a senha)',
          },
        );
      }

      // Adicionar resposta de erro de autenticação
      if (postOp.responses && !postOp.responses['401']) {
        postOp.responses['401'] = {
          description: 'Não autorizado - Token JWT ausente ou inválido',
          content: {
            'application/json': {
              examples: {
                unauthorized: {
                  value: USER_ERROR_EXAMPLES.UNAUTHORIZED,
                  summary: 'Acesso não autorizado',
                  description:
                    'O token JWT está ausente, expirado ou é inválido',
                },
              },
            },
          },
        };
      }

      if (
        postOp.responses &&
        postOp.responses['400'] &&
        !('$ref' in postOp.responses['400'])
      ) {
        addResponseExample(
          postOp.responses['400'],
          USER_ERROR_EXAMPLES.VALIDATION_ERROR,
          {
            summary: 'Dados inválidos',
            description: 'Os dados fornecidos não passaram na validação',
          },
        );
      }

      if (
        postOp.responses &&
        postOp.responses['409'] &&
        !('$ref' in postOp.responses['409'])
      ) {
        addResponseExample(
          postOp.responses['409'],
          USER_ERROR_EXAMPLES.CONFLICT,
          {
            summary: 'Email já em uso',
            description: 'Um usuário com este email já existe',
          },
        );
      }
    }

    // GET /users (findAll) - Protegido com JWT
    if (document.paths['/users'].get) {
      const getOp = document.paths['/users'].get;
      enhanceOperation(getOp, USER_API_OPERATIONS.FIND_ALL);
      getOp.description +=
        '\n\nEste endpoint retorna todos os usuários cadastrados na plataforma sem paginação. As senhas não são incluídas nas respostas por motivos de segurança.' +
        '\n\n**Este endpoint requer autenticação JWT.** Use o botão Authorize acima para fornecer seu token JWT.';

      // Adicionar requisito de autenticação
      getOp.security = [{ bearerAuth: [] }];

      // Adicionar exemplos de resposta para o endpoint GET /users
      if (
        getOp.responses &&
        getOp.responses['200'] &&
        !('$ref' in getOp.responses['200'])
      ) {
        addResponseExample(
          getOp.responses['200'],
          USER_RESPONSE_EXAMPLES.USER_LIST,
          {
            summary: 'Lista de usuários',
            description:
              'Retorna todos os usuários cadastrados (sem as senhas)',
          },
        );
      }

      // Adicionar resposta de erro de autenticação
      if (getOp.responses && !getOp.responses['401']) {
        getOp.responses['401'] = {
          description: 'Não autorizado - Token JWT ausente ou inválido',
          content: {
            'application/json': {
              examples: {
                unauthorized: {
                  value: USER_ERROR_EXAMPLES.UNAUTHORIZED,
                  summary: 'Acesso não autorizado',
                  description:
                    'O token JWT está ausente, expirado ou é inválido',
                },
              },
            },
          },
        };
      }
    }
  }

  // Aprimorar o endpoint GET /users/{id} (findOne) - Protegido com JWT
  if (document.paths['/users/{id}'] && document.paths['/users/{id}'].get) {
    const getOneOp = document.paths['/users/{id}'].get;
    enhanceOperation(getOneOp, USER_API_OPERATIONS.FIND_ONE);
    getOneOp.description +=
      '\n\nRetorna detalhes de um único usuário usando seu ID numérico. A senha não é incluída na resposta por motivos de segurança.' +
      '\n\n**Este endpoint requer autenticação JWT.** Use o botão Authorize acima para fornecer seu token JWT.';

    // Adicionar requisito de autenticação
    getOneOp.security = [{ bearerAuth: [] }];

    // Melhorar descrição do parâmetro de caminho (ApiParam)
    enhanceIdParameter(getOneOp);

    // Adicionar exemplos de resposta para o endpoint GET /users/{id}
    if (
      getOneOp.responses &&
      getOneOp.responses['200'] &&
      !('$ref' in getOneOp.responses['200'])
    ) {
      addResponseExample(
        getOneOp.responses['200'],
        USER_RESPONSE_EXAMPLES.SINGLE_USER,
        {
          summary: 'Usuário encontrado',
          description:
            'Retorna os detalhes do usuário solicitado (sem a senha)',
        },
      );
    }

    if (
      getOneOp.responses &&
      getOneOp.responses['404'] &&
      !('$ref' in getOneOp.responses['404'])
    ) {
      addResponseExample(
        getOneOp.responses['404'],
        USER_ERROR_EXAMPLES.NOT_FOUND,
        {
          summary: 'Usuário não encontrado',
          description: 'Não existe usuário com o ID informado',
        },
      );
    }

    // Adicionar resposta de erro de autenticação
    if (getOneOp.responses && !getOneOp.responses['401']) {
      getOneOp.responses['401'] = {
        description: 'Não autorizado - Token JWT ausente ou inválido',
        content: {
          'application/json': {
            examples: {
              unauthorized: {
                value: USER_ERROR_EXAMPLES.UNAUTHORIZED,
                summary: 'Acesso não autorizado',
                description: 'O token JWT está ausente, expirado ou é inválido',
              },
            },
          },
        },
      };
    }

    // Aprimorar o endpoint PUT /users/{id} (update) - Protegido com JWT
    if (document.paths['/users/{id}'] && document.paths['/users/{id}'].put) {
      const updateOp = document.paths['/users/{id}'].put;
      enhanceOperation(updateOp, USER_API_OPERATIONS.UPDATE_USER);
      updateOp.description +=
        '\n\nAtualiza os dados de um usuário existente com validação dos mesmos campos usados na criação. Caso a senha seja atualizada, ela será hasheada automaticamente antes de ser armazenada. A senha nunca é retornada nas respostas.' +
        '\n\n**Este endpoint requer autenticação JWT.** Use o botão Authorize acima para fornecer seu token JWT.';

      // Adicionar requisito de autenticação
      updateOp.security = [{ bearerAuth: [] }];

      // Melhorar descrição do parâmetro de caminho (ApiParam)
      enhanceIdParameter(updateOp);

      // Adicionar exemplo de request body (ApiBody)
      enhanceUpdateRequestBody(updateOp);

      // Adicionar exemplos de resposta para o endpoint PUT /users/{id}
      if (
        updateOp.responses &&
        updateOp.responses['200'] &&
        !('$ref' in updateOp.responses['200'])
      ) {
        addResponseExample(
          updateOp.responses['200'],
          USER_RESPONSE_EXAMPLES.SINGLE_USER,
          {
            summary: 'Usuário atualizado',
            description:
              'Retorna os dados atualizados do usuário (sem a senha)',
          },
        );
      }

      if (
        updateOp.responses &&
        updateOp.responses['404'] &&
        !('$ref' in updateOp.responses['404'])
      ) {
        addResponseExample(
          updateOp.responses['404'],
          USER_ERROR_EXAMPLES.NOT_FOUND,
          {
            summary: 'Usuário não encontrado',
            description: 'Não existe usuário com o ID informado',
          },
        );
      }

      if (
        updateOp.responses &&
        updateOp.responses['400'] &&
        !('$ref' in updateOp.responses['400'])
      ) {
        addResponseExample(
          updateOp.responses['400'],
          USER_ERROR_EXAMPLES.VALIDATION_ERROR,
          {
            summary: 'Dados inválidos',
            description: 'Os dados fornecidos não passaram na validação',
          },
        );
      }

      if (
        updateOp.responses &&
        updateOp.responses['409'] &&
        !('$ref' in updateOp.responses['409'])
      ) {
        addResponseExample(
          updateOp.responses['409'],
          USER_ERROR_EXAMPLES.CONFLICT,
          {
            summary: 'Email já em uso',
            description:
              'O novo email fornecido já está associado a outro usuário',
          },
        );
      }

      // Adicionar resposta de erro de autenticação
      if (updateOp.responses && !updateOp.responses['401']) {
        updateOp.responses['401'] = {
          description: 'Não autorizado - Token JWT ausente ou inválido',
          content: {
            'application/json': {
              examples: {
                unauthorized: {
                  value: USER_ERROR_EXAMPLES.UNAUTHORIZED,
                  summary: 'Acesso não autorizado',
                  description:
                    'O token JWT está ausente, expirado ou é inválido',
                },
              },
            },
          },
        };
      }
    }
  }
}
