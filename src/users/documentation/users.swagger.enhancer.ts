import { OpenAPIObject } from '@nestjs/swagger';
import {
  USER_RESPONSE_EXAMPLES,
  USER_ERROR_EXAMPLES,
  USER_API_OPERATIONS,
  USER_API_RESPONSES,
} from './users.document';
import {
  ResponseObject,
  ReferenceObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Adiciona documentação avançada para os endpoints de usuários
 *
 * @param document Documento OpenAPI a ser aprimorado
 */
export function enhanceUsersSwaggerDocs(document: OpenAPIObject): void {
  // Certifique-se de que as propriedades necessárias existem
  if (!document.paths) return;

  // Aprimorar o endpoint POST /users
  if (document.paths['/users']) {
    // Adicionar exemplos detalhados para POST
    if (document.paths['/users'].post) {
      const postOp = document.paths['/users'].post;
      postOp.summary = USER_API_OPERATIONS.CREATE_USER.summary;
      postOp.description = USER_API_OPERATIONS.CREATE_USER.description;

      // Adicionar exemplo de request body
      if (postOp.requestBody && !('$ref' in postOp.requestBody)) {
        if (
          postOp.requestBody.content &&
          postOp.requestBody.content['application/json']
        ) {
          postOp.requestBody.content['application/json'].examples = {
            validUser: {
              summary: 'Usuário válido',
              value: {
                name: 'João Silva',
                email: 'joao.silva@exemplo.com',
              },
            },
            invalidUser: {
              summary: 'Usuário inválido (email incorreto)',
              value: {
                name: 'João Silva',
                email: 'email-invalido',
              },
            },
          };
        }
      }

      // Adicionar exemplos de respostas
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

        // Resposta de erro - Conflict
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

        // Resposta de erro - Internal Server Error
        enhanceResponse(
          postOp.responses['500'],
          USER_API_RESPONSES.INTERNAL_SERVER_ERROR.description,
          USER_ERROR_EXAMPLES.INTERNAL_SERVER_ERROR,
          {
            summary: 'Erro no servidor',
            description:
              'Ocorreu um erro interno no servidor ao tentar criar o usuário, como problemas de conexão com o banco de dados',
          },
        );
      }
    }
  }

  // Aprimorar o endpoint GET /users
  if (document.paths['/users'] && document.paths['/users'].get) {
    const getOp = document.paths['/users'].get;
    getOp.summary = USER_API_OPERATIONS.FIND_ALL.summary;
    getOp.description = USER_API_OPERATIONS.FIND_ALL.description;
    getOp.description +=
      '\n\nEste endpoint retorna todos os usuários cadastrados na plataforma sem paginação.';

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
        getOp.responses['200'].content['application/json'].examples.emptyList =
          {
            summary: 'Lista vazia',
            value: [],
            description: 'Quando não existem usuários cadastrados',
          };
      }
    }
  }

  // Aprimorar o endpoint GET /users/simulate-latency
  if (
    document.paths['/users/simulate-latency'] &&
    document.paths['/users/simulate-latency'].get
  ) {
    const getOp = document.paths['/users/simulate-latency'].get;
    getOp.summary = USER_API_OPERATIONS.SIMULATE_LATENCY.summary;
    getOp.description = USER_API_OPERATIONS.SIMULATE_LATENCY.description;
    getOp.description +=
      '\n\nEste endpoint adiciona um delay de 700ms para simular operações de alta latência. Útil para testes de timeout e comportamento do sistema com operações lentas.';

    if (getOp.responses) {
      enhanceResponse(
        getOp.responses['200'],
        USER_API_RESPONSES.FIND_ALL_SUCCESS.description,
        USER_RESPONSE_EXAMPLES.USER_LIST,
        {
          summary: 'Lista de usuários (com atraso)',
          description:
            'Mesma resposta do endpoint /users, mas com atraso intencional de 700ms',
        },
      );
    }
  }

  // Aprimorar o endpoint GET /users/{id}
  if (document.paths['/users/{id}'] && document.paths['/users/{id}'].get) {
    const getOneOp = document.paths['/users/{id}'].get;
    getOneOp.summary = USER_API_OPERATIONS.FIND_ONE.summary;
    getOneOp.description = USER_API_OPERATIONS.FIND_ONE.description;
    getOneOp.description +=
      '\n\nRetorna detalhes de um único usuário usando seu ID numérico.';

    // Melhorar descrição do parâmetro de caminho
    if (getOneOp.parameters && getOneOp.parameters.length > 0) {
      const idParam = getOneOp.parameters.find(
        (p) => !('$ref' in p) && p.name === 'id',
      );
      if (idParam && !('$ref' in idParam)) {
        idParam.description = 'ID numérico único do usuário no banco de dados';
        idParam.example = 1;
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

      // Resposta de erro - Not Found
      enhanceResponse(
        getOneOp.responses['404'],
        USER_API_RESPONSES.NOT_FOUND.description,
        {
          statusCode: 404,
          message: 'Usuário com ID 42 não encontrado',
          error: 'Not Found',
        },
        {
          summary: 'Usuário não encontrado',
          description:
            'Nenhum usuário com o ID fornecido foi encontrado no banco de dados',
        },
      );
    }
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
