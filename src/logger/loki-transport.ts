import * as pino from 'pino';

/**
 * Cria a configuração de transporte apropriada para o ambiente atual
 */
export function createLoggerTransport():
  | pino.TransportMultiOptions
  | pino.TransportSingleOptions
  | undefined {
  console.log(
    'Configurando transport para logs. NODE_ENV:',
    process.env.NODE_ENV,
  );
  console.log('LOKI_URL:', process.env.LOKI_URL);

  // Se tivermos URL do Loki, independente do ambiente
  if (process.env.LOKI_URL) {
    // Em desenvolvimento, usar tanto pino-pretty quanto pino-loki
    if (process.env.NODE_ENV !== 'production') {
      return {
        targets: [
          // Pretty print para console
          {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
              messageFormat: '{context}: {msg}',
            },
            level: 'debug',
          },
          // Enviar para Loki
          {
            target: 'pino-loki',
            options: {
              batching: true,
              interval: 5,
              host: process.env.LOKI_URL,

              // Configurações críticas para resolver o erro
              replaceTimestamp: true, // Evita problemas com timestamp
              print: false, // Não imprime logs enviados

              // Simplificar labels para reduzir problemas de formato
              labels: {
                app: process.env.OTEL_SERVICE_NAME || 'nest-app',
                env: process.env.NODE_ENV || 'development',
              },

              // Modo JSON garante melhor compatibilidade
              jsonOutput: true,
            },
            level: 'debug',
          },
        ],
      };
    } else {
      // Em produção, apenas Loki
      return {
        target: 'pino-loki',
        options: {
          batching: true,
          interval: 5,
          host: process.env.LOKI_URL,
          replaceTimestamp: true,
          print: false,
          labels: {
            app: process.env.OTEL_SERVICE_NAME || 'nest-app',
            env: 'production',
          },
          jsonOutput: true,
        },
      };
    }
  }

  // Se não tiver Loki, usar pino-pretty em dev e nada em prod
  if (process.env.NODE_ENV !== 'production') {
    return {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        messageFormat: '{context}: {msg}',
      },
    };
  }

  return undefined;
}
