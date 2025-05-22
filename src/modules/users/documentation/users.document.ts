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
  // Exemplos de request com password (não usado nas respostas)
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
    // Atualização parcial mantendo o mesmo email e senha
  },
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
};

/**
 * Documentação das operações do controller de usuários
 */
export const USER_API_OPERATIONS = {
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

  UPDATE_SUCCESS: {
    status: 200,
    description: 'Usuário atualizado com sucesso',
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
