import {
  ApiResponseOptions,
  ApiOperationOptions,
  ApiParamOptions,
} from '@nestjs/swagger';

/**
 * Exemplos de respostas de sucesso para o módulo de usuários
 */
export const USER_RESPONSE_EXAMPLES = {
  SINGLE_USER: {
    id: 1,
    name: 'João Silva',
    email: 'joao.silva@exemplo.com',
    createdAt: '2025-05-21T10:00:00.000Z',
    updatedAt: '2025-05-21T10:00:00.000Z',
  },
  USER_LIST: [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@exemplo.com',
      createdAt: '2025-05-21T10:00:00.000Z',
      updatedAt: '2025-05-21T10:00:00.000Z',
    },
    {
      id: 2,
      name: 'Maria Souza',
      email: 'maria.souza@exemplo.com',
      createdAt: '2025-05-21T11:00:00.000Z',
      updatedAt: '2025-05-21T11:00:00.000Z',
    },
  ],
};

/**
 * Exemplos de erros para o módulo de usuários
 */
export const USER_ERROR_EXAMPLES = {
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
    ],
    error: 'Bad Request',
  },
  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    message: 'Erro ao criar usuário',
    error: 'Internal Server Error',
  },
};

/**
 * Documentação das operações do controller de usuários
 */
export const USER_API_OPERATIONS = {
  CREATE_USER: {
    summary: 'Criar novo usuário',
    description: 'Cria um novo usuário no sistema com nome e email',
  } as ApiOperationOptions,

  FIND_ALL: {
    summary: 'Listar todos os usuários',
    description: 'Retorna a lista completa de usuários cadastrados no sistema',
  } as ApiOperationOptions,

  FIND_ONE: {
    summary: 'Buscar usuário por ID',
    description:
      'Localiza e retorna os dados de um usuário específico pelo seu ID',
  } as ApiOperationOptions,

  SIMULATE_LATENCY: {
    summary: 'Simular consulta lenta',
    description:
      'Endpoint que simula uma consulta lenta ao banco de dados com 700ms de delay. Útil para testes de timeout e métricas de performance.',
  } as ApiOperationOptions,
};

/**
 * Documentação dos parâmetros das rotas
 */
export const USER_API_PARAMS = {
  ID: {
    name: 'id',
    description: 'ID numérico do usuário',
    required: true,
    example: 1,
    type: Number,
  } as ApiParamOptions,
};

/**
 * Documentação das respostas da API
 */
export const USER_API_RESPONSES = {
  CREATE_SUCCESS: {
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      example: USER_RESPONSE_EXAMPLES.SINGLE_USER,
    },
  } as ApiResponseOptions,

  FIND_ALL_SUCCESS: {
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    schema: {
      example: USER_RESPONSE_EXAMPLES.USER_LIST,
    },
  } as ApiResponseOptions,

  FIND_ONE_SUCCESS: {
    status: 200,
    description: 'Usuário encontrado com sucesso',
    schema: {
      example: USER_RESPONSE_EXAMPLES.SINGLE_USER,
    },
  } as ApiResponseOptions,

  BAD_REQUEST: {
    status: 400,
    description: 'Dados inválidos fornecidos na requisição',
    schema: {
      example: USER_ERROR_EXAMPLES.VALIDATION_ERROR,
    },
  } as ApiResponseOptions,

  NOT_FOUND: {
    status: 404,
    description: 'Usuário não encontrado',
    schema: {
      example: USER_ERROR_EXAMPLES.NOT_FOUND,
    },
  } as ApiResponseOptions,

  CONFLICT: {
    status: 409,
    description: 'Usuário com este email já existe',
    schema: {
      example: USER_ERROR_EXAMPLES.CONFLICT,
    },
  } as ApiResponseOptions,

  INTERNAL_SERVER_ERROR: {
    status: 500,
    description: 'Erro interno do servidor',
    schema: {
      example: USER_ERROR_EXAMPLES.INTERNAL_SERVER_ERROR,
    },
  } as ApiResponseOptions,
};
