/**
 * @fileoverview Ponto de entrada principal da aplicação NestJS com observabilidade.
 * Este arquivo implementa uma sequência específica de inicialização para garantir
 * que as instrumentações OpenTelemetry sejam registradas antes de qualquer
 * outro módulo ser carregado.
 */

// IMPORTANTE: O tracing deve ser configurado antes de importar qualquer outro módulo
import './tracing/register-tracing';

// Segundo import deve ser o inicializador do tracing
import initTracing from './tracing/tracing';

// Inicializa o SDK do tracing imediatamente
initTracing();

// Somente após garantir que o tracing está configurado, importar outros módulos
import { bootstrap } from './bootstrap';

/**
 * Inicializa a aplicação NestJS
 *
 * @async
 * @returns {Promise<void>} Uma promise que resolve quando a aplicação estiver inicializada
 */
async function start(): Promise<void> {
  try {
    // Inicia o NestJS
    await bootstrap();
  } catch (err) {
    console.error('Erro ao inicializar a aplicação:', err);
    process.exit(1);
  }
}

// Iniciar a aplicação
start();
