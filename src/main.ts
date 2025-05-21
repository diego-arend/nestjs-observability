/**
 * @fileoverview Ponto de entrada principal da aplicação NestJS com observabilidade.
 * Este arquivo implementa uma sequência específica de inicialização para garantir
 * que as instrumentações OpenTelemetry sejam registradas antes de qualquer
 * outro módulo ser carregado.
 *
 * A sequência de inicialização é crítica para a observabilidade:
 * 1. Registrar instrumentações OpenTelemetry (primeiro arquivo importado)
 * 2. Inicializar o SDK OpenTelemetry
 * 3. Iniciar a aplicação NestJS
 *
 * @module main
 */

// Primeiro import deve ser o registro de tracing
import './tracing/register-tracing';

// Segundo import deve ser o inicializador do tracing
import initTracing from './tracing/tracing';

// Somente após garantir que o registro das instrumentações está completo,
// importar outros módulos da aplicação
import { bootstrap } from './bootstrap';

/**
 * Inicializa a aplicação em sequência controlada:
 * 1. Primeiro configura o SDK de tracing OpenTelemetry
 * 2. Em seguida inicializa o framework NestJS
 *
 * Esta sequência garante que todos os componentes sejam devidamente
 * monitorados e traçados pelo OpenTelemetry.
 *
 * @async
 * @returns {Promise<void>} Uma promise que resolve quando a aplicação estiver completamente inicializada
 */
async function start(): Promise<void> {
  // Inicializa o SDK do tracing (as instrumentações já foram registradas)
  initTracing();

  // Inicia o NestJS
  await bootstrap();
}

// Iniciar a aplicação com tratamento de erros
start().catch((err) => {
  console.error('Erro ao inicializar a aplicação:', err);
  process.exit(1);
});
