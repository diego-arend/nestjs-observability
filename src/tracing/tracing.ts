import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  shouldSkipMonitoring,
  EXCLUDED_PATHS,
} from '../filters/filter-endpoints';

export function initTracing() {
  try {
    console.log('Inicializando o sistema de tracing...');

    // Configurar o exportador OTLP para enviar traces ao Tempo
    const traceExporter = new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    });

    // Configurar o SDK
    const sdk = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]:
          process.env.OTEL_SERVICE_NAME,
      }),
      traceExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-http': {
            enabled: true,
            ignoreIncomingRequestHook: (req) => {
              const url = req.url;
              if (!url) return false;
              return shouldSkipMonitoring(url);
            },
          },
          '@opentelemetry/instrumentation-express': { enabled: true },
          '@opentelemetry/instrumentation-nestjs-core': { enabled: true },
          // Desabilitar a instrumentação gRPC
          '@opentelemetry/instrumentation-grpc': { enabled: false },
        }),
      ],
    });

    // Iniciar o SDK
    sdk.start();

    console.log(
      `Sistema de tracing inicializado com sucesso. Endpoints excluídos: ${EXCLUDED_PATHS.join(', ')}`,
    );

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
