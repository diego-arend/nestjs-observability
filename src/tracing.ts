import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

// Ativar diagnósticos para debug (opcional)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

export function initTracing() {
  try {
    console.log('Inicializando o sistema de tracing...');

    // Configurar o exportador OTLP para enviar traces ao Tempo
    const traceExporter = new OTLPTraceExporter({
      url:
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
        'http://localhost:4318/v1/traces',
    });

    // Configurar o SDK usando a abordagem moderna
    const sdk = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]:
          process.env.OTEL_SERVICE_NAME || 'nest-app',
      }),
      traceExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-http': { enabled: true },
          '@opentelemetry/instrumentation-express': { enabled: true },
          '@opentelemetry/instrumentation-nestjs-core': { enabled: true },
          '@opentelemetry/instrumentation-pg': { enabled: true },
          // Desabilitar instrumentações desnecessárias
          '@opentelemetry/instrumentation-fs': { enabled: false },
        }),
      ],
    });

    // Iniciar o SDK
    sdk.start();

    console.log('Sistema de tracing inicializado com sucesso');

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Desligando o sistema de tracing...');
      sdk
        .shutdown()
        .then(() => console.log('Tracing encerrado com sucesso'))
        .catch((err) => console.error('Erro ao encerrar o tracing', err))
        .finally(() => process.exit(0));
    });

    return true;
  } catch (error) {
    console.error('Erro ao inicializar o sistema de tracing:', error);
    return false;
  }
}

export default initTracing;
