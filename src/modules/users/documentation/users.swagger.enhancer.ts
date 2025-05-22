import { OpenAPIObject, ApiOperationOptions } from '@nestjs/swagger';
import {
  USER_RESPONSE_EXAMPLES,
  USER_ERROR_EXAMPLES,
  USER_API_OPERATIONS,
  USER_API_RESPONSES,
  USER_API_PARAMS,
} from './users.document';
import {
  ResponseObject,
  ReferenceObject,
  OperationObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Adiciona documentação avançada para os endpoints de usuários
 *
 * @param document Documento OpenAPI a ser aprimorado
 */
export function enhanceUsersSwaggerDocs(document: OpenAPIObject): void {
  // Certifique-se de que as propriedades necessárias existem
  if (!document.paths) return;

  // Adicionar informações extras às tags
  if (document.tags) {
    const usersTag = document.tags.find((tag) => tag.name === 'users');
    if (usersTag) {
      usersTag.description = 'API para gerenciamento de usuários no sistema';
    }
  }

  // Aprimorar o endpoint POST /users
  if (document.paths['/users']) {
    // Adicionar exemplos detalhados para POST
    if (document.paths['/users'].post) {
      const postOp = document.paths['/users'].post;
      enhanceOperation(postOp, USER_API_OPERATIONS.CREATE_USER);
      postOp.description +=
        '\n\nEste endpoint cria um novo usuário com nome, email e senha. A senha será armazenada de forma segura (hasheada) e nunca será retornada nas respostas.';

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
              value: {
                name: 'João Silva',
                email: 'joao.silva@exemplo.com',
                password: 'Senha@123',
              },
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

      // Adicionar exemplos de respostas usando ApiResponse
      if (postOp.responses) {
        // Resposta de sucesso
        enhanceResponse(
          postOp.responses['201'],
          USER_API_RESPONSES.CREATE_SUCCESS.description,
          USER_RESPONSE_EXAMPLES.SINGLE_USER,
          {
            summary: 'Usuário criado com sucesso',
            description:
              'O usuário foi criado no banco de dados e retornado com seu ID',
          },
        );

        // Garantir que todos os status codes esperados no service existam na documentação
        // Primeiro verificar se já existe, e se não, adicionar
        if (!postOp.responses['400']) {
          postOp.responses['400'] = {
            description: USER_API_RESPONSES.BAD_REQUEST.description,
          };
        }

        // Resposta de erro - Bad Request
        enhanceResponse(
          postOp.responses['400'],
          USER_API_RESPONSES.BAD_REQUEST.description,
          USER_ERROR_EXAMPLES.VALIDATION_ERROR,
          {
            summary: 'Dados inválidos',
            description:
              'Os dados fornecidos não passaram nas validações, como email inválido ou nome vazio',
          },
        );

        // Erro - Conflict (usuário já existe)
        if (!postOp.responses['409']) {
          postOp.responses['409'] = {
            description: USER_API_RESPONSES.CONFLICT.description,
          };
        }

        enhanceResponse(
          postOp.responses['409'],
          USER_API_RESPONSES.CONFLICT.description,
          USER_ERROR_EXAMPLES.CONFLICT,
          {
            summary: 'Email já existente',
            description:
              'Tentativa de criar um usuário com um email que já está sendo usado por outro usuário',
          },
        );

        // Erro interno - Diretamente do users.service.ts
        if (!postOp.responses['500']) {
          postOp.responses['500'] = {
            description: USER_API_RESPONSES.INTERNAL_SERVER_ERROR.description,
          };
        }

        enhanceResponse(
          postOp.responses['500'],
          USER_API_RESPONSES.INTERNAL_SERVER_ERROR.description,
          {
            statusCode: 500,
            message: 'Erro ao criar usuário',
            error: 'Internal Server Error',
            timestamp: new Date().toISOString(),
            path: '/users',
          },
          {
            summary: 'Erro no servidor',
            description:
              'Ocorreu um erro interno no servidor ao tentar criar o usuário, como problemas de conexão com o banco de dados',
          },
        );
      }
    }

    // GET /users (findAll)
    if (document.paths['/users'].get) {
      const getOp = document.paths['/users'].get;
      enhanceOperation(getOp, USER_API_OPERATIONS.FIND_ALL);
      getOp.description +=
        '\n\nEste endpoint retorna todos os usuários cadastrados na plataforma sem paginação. As senhas não são incluídas nas respostas por motivos de segurança.';

      if (getOp.responses) {
        enhanceResponse(
          getOp.responses['200'],
          USER_API_RESPONSES.FIND_ALL_SUCCESS.description,
          USER_RESPONSE_EXAMPLES.USER_LIST,
          {
            summary: 'Lista de usuários',
            description:
              'Retorna um array de usuários, que pode estar vazio se não houver registros',
          },
        );

        // Adicionar exemplo de resposta vazia
        if (
          !('$ref' in getOp.responses['200']) &&
          getOp.responses['200'].content &&
          getOp.responses['200'].content['application/json']
        ) {
          getOp.responses['200'].content[
            'application/json'
          ].examples.emptyList = {
            summary: 'Lista vazia',
            value: [],
            description: 'Quando não existem usuários cadastrados',
          };
        }

        // Erro interno - Diretamente do users.service.ts
        if (!getOp.responses['500']) {
          getOp.responses['500'] = {
            description: USER_API_RESPONSES.INTERNAL_SERVER_ERROR.description,
          };
        }

        enhanceResponse(
          getOp.responses['500'],
          USER_API_RESPONSES.INTERNAL_SERVER_ERROR.description,
          {
            statusCode: 500,
            message: 'Erro ao buscar usuários',
            error: 'Internal Server Error',
            timestamp: new Date().toISOString(),
            path: '/users',
          },
          {
            summary: 'Erro no servidor',
            description:
              'Falha ao acessar o banco de dados para listar usuários',
          },
        );
      }
    }
  }

  // Aprimorar o endpoint GET /users/{id} (findOne)
  if (document.paths['/users/{id}'] && document.paths['/users/{id}'].get) {
    const getOneOp = document.paths['/users/{id}'].get;
    enhanceOperation(getOneOp, USER_API_OPERATIONS.FIND_ONE);
    getOneOp.description +=
      '\n\nRetorna detalhes de um único usuário usando seu ID numérico. A senha não é incluída na resposta por motivos de segurança.';

    // Melhorar descrição do parâmetro de caminho (ApiParam)
    if (getOneOp.parameters && getOneOp.parameters.length > 0) {
      const idParam = getOneOp.parameters.find(
        (p) => !('$ref' in p) && p.name === 'id',
      );
      if (idParam && !('$ref' in idParam)) {
        idParam.description = USER_API_PARAMS.ID.description;
        idParam.example = USER_API_PARAMS.ID.example;
        idParam.required = true;
        idParam.schema = {
          type: 'integer',
          format: 'int32',
          minimum: 1,
        };
      }
    }

    if (getOneOp.responses) {
      // Resposta de sucesso
      enhanceResponse(
        getOneOp.responses['200'],
        USER_API_RESPONSES.FIND_ONE_SUCCESS.description,
        USER_RESPONSE_EXAMPLES.SINGLE_USER,
        {
          summary: 'Usuário encontrado',
          description:
            'Os detalhes completos do usuário foram encontrados e retornados',
        },
      );

      // Erro - Not Found (NotFoundException no service)
      if (!getOneOp.responses['404']) {
        getOneOp.responses['404'] = {
          description: USER_API_RESPONSES.NOT_FOUND.description,
        };
      }

      enhanceResponse(
        getOneOp.responses['404'],
        USER_API_RESPONSES.NOT_FOUND.description,
        {
          statusCode: 404,
          message: 'Usuário com ID 42 não encontrado',
          error: 'Not Found',
          timestamp: new Date().toISOString(),
          path: '/users/42',
        },
        {
          summary: 'Usuário não encontrado',
          description:
            'Nenhum usuário com o ID fornecido foi encontrado no banco de dados',
        },
      );

      // Erro interno - Diretamente do users.service.ts
      if (!getOneOp.responses['500']) {
        getOneOp.responses['500'] = {
          description: USER_API_RESPONSES.INTERNAL_SERVER_ERROR.description,
        };
      }

      enhanceResponse(
        getOneOp.responses['500'],
        USER_API_RESPONSES.INTERNAL_SERVER_ERROR.description,
        {
          statusCode: 500,
          message: 'Erro ao buscar usuário com ID 42',
          error: 'Internal Server Error',
          timestamp: new Date().toISOString(),
          path: '/users/42',
        },
        {
          summary: 'Erro no servidor',
          description: 'Falha ao acessar o banco de dados para buscar usuário',
        },
      );
    }
  }

  // Aprimorar o endpoint PUT /users/{id} (update)
  if (document.paths['/users/{id}'] && document.paths['/users/{id}'].put) {
    const updateOp = document.paths['/users/{id}'].put;
    enhanceOperation(updateOp, USER_API_OPERATIONS.UPDATE_USER);
    updateOp.description +=
      '\n\nAtualiza os dados de um usuário existente com validação dos mesmos campos usados na criação. Caso a senha seja atualizada, ela será hasheada automaticamente antes de ser armazenada. A senha nunca é retornada nas respostas.';

    // Melhorar descrição do parâmetro de caminho (ApiParam)
    if (updateOp.parameters && updateOp.parameters.length > 0) {
      const idParam = updateOp.parameters.find(
        (p) => !('$ref' in p) && p.name === 'id',
      );
      if (idParam && !('$ref' in idParam)) {
        idParam.description = 'ID numérico único do usuário a ser atualizado';
        idParam.example = 1;
        idParam.required = true;
        idParam.schema = {
          type: 'integer',
          format: 'int32',
          minimum: 1,
        };
      }
    }

    // Adicionar exemplo de request body (ApiBody)
    if (updateOp.requestBody && !('$ref' in updateOp.requestBody)) {
      if (
        updateOp.requestBody.content &&
        updateOp.requestBody.content['application/json']
      ) {
        updateOp.requestBody.description =
          'Dados do usuário a serem atualizados';
        updateOp.requestBody.required = true;
        updateOp.requestBody.content['application/json'].examples = {
          fullUpdate: {
            summary: 'Atualização completa',
            description: 'Atualiza todos os campos do usuário',
            value: {
              name: 'João Silva Atualizado',
              email: 'joao.silva.novo@exemplo.com',
              password: 'NovaSenha@123',
            },
          },
          partialUpdate: {
            summary: 'Atualização parcial (apenas nome)',
            description:
              'Atualiza apenas o nome do usuário, mantendo o email e senha',
            value: {
              name: 'João Silva Atualizado',
            },
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

    if (updateOp.responses) {
      // Resposta de sucesso
      enhanceResponse(
        updateOp.responses['200'],
        USER_API_RESPONSES.UPDATE_SUCCESS.description,
        USER_RESPONSE_EXAMPLES.SINGLE_USER,
        {
          summary: 'Usuário atualizado',
          description:
            'Os dados do usuário foram atualizados com sucesso e os novos valores são retornados',
        },
      );

      // Erro - Bad Request (validação)
      if (!updateOp.responses['400']) {
        updateOp.responses['400'] = {
          description: USER_API_RESPONSES.BAD_REQUEST.description,
        };
      }

      enhanceResponse(
        updateOp.responses['400'],
        USER_API_RESPONSES.BAD_REQUEST.description,
        USER_ERROR_EXAMPLES.VALIDATION_ERROR,
        {
          summary: 'Dados inválidos',
          description:
            'Os dados fornecidos não passaram nas validações, como email inválido',
        },
      );

      // Erro - Not Found (NotFoundException no service)
      if (!updateOp.responses['404']) {
        updateOp.responses['404'] = {
          description: USER_API_RESPONSES.NOT_FOUND.description,
        };
      }

      enhanceResponse(
        updateOp.responses['404'],
        USER_API_RESPONSES.NOT_FOUND.description,
        {
          statusCode: 404,
          message: 'Usuário com ID 42 não encontrado',
          error: 'Not Found',
          timestamp: new Date().toISOString(),
          path: '/users/42',
        },
        {
          summary: 'Usuário não encontrado',
          description:
            'Nenhum usuário com o ID fornecido foi encontrado no banco de dados',
        },
      );

      // Erro - Conflict (ConflictException no service - email já usado)
      if (!updateOp.responses['409']) {
        updateOp.responses['409'] = {
          description: USER_API_RESPONSES.CONFLICT.description,
        };
      }

      enhanceResponse(
        updateOp.responses['409'],
        USER_API_RESPONSES.CONFLICT.description,
        {
          statusCode: 409,
          message: 'Usuário com email joao.silva.novo@exemplo.com já existe',
          error: 'Conflict',
          timestamp: new Date().toISOString(),
          path: '/users/42',
        },
        {
          summary: 'Email já existente',
          description:
            'O email fornecido já está sendo usado por outro usuário',
        },
      );

      // Erro interno - Diretamente do users.service.ts
      if (!updateOp.responses['500']) {
        updateOp.responses['500'] = {
          description: USER_API_RESPONSES.INTERNAL_SERVER_ERROR.description,
        };
      }

      enhanceResponse(
        updateOp.responses['500'],
        USER_API_RESPONSES.INTERNAL_SERVER_ERROR.description,
        {
          statusCode: 500,
          message: 'Erro ao atualizar usuário com ID 42',
          error: 'Internal Server Error',
          timestamp: new Date().toISOString(),
          path: '/users/42',
        },
        {
          summary: 'Erro no servidor',
          description:
            'Ocorreu um erro interno no servidor ao tentar atualizar o usuário',
        },
      );
    }
  }
}

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
 * Verifica se o objeto é um ResponseObject (não uma referência)
 * e então aprimora com descrição e exemplos
 *
 * @param response A resposta a ser aprimorada
 * @param description Descrição a ser adicionada
 * @param example Exemplo a ser adicionado
 * @param exampleMeta Metadados adicionais para o exemplo (summary, description)
 */
function enhanceResponse(
  response: ResponseObject | ReferenceObject | undefined,
  description: string,
  example: any,
  exampleMeta: { summary?: string; description?: string } = {},
): void {
  if (!response) return;

  // Verificar se é um ResponseObject (não uma ReferenceObject)
  if (!('$ref' in response)) {
    // É um ResponseObject, podemos definir a descrição
    response.description = description;
    addResponseExample(response, example, exampleMeta);
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
