/**
 * @fileoverview Este arquivo deve ser importado como o primeiro arquivo na aplicação
 * para garantir que o registro das instrumentações OpenTelemetry ocorra antes de qualquer
 * módulo ser carregado.
 *
 * @module register-tracing
 */

import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Configurar nível de log adequado (evitar duplicações)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

console.log('Registrando instrumentações OpenTelemetry no nível mais alto...');

// Registrar instrumentações no nível mais alto possível
registerInstrumentations({
  instrumentations: [
    getNodeAutoInstrumentations({
      // Desabilitar a instrumentação gRPC para evitar o aviso
      '@opentelemetry/instrumentation-grpc': { enabled: false },
      '@opentelemetry/instrumentation-nestjs-core': { enabled: true },
      '@opentelemetry/instrumentation-pg': { enabled: true },
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

console.log('Instrumentações OpenTelemetry registradas com sucesso!');
