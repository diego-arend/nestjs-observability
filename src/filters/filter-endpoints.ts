/**
 * Utilitário para filtrar endpoints de manutenção que não devem ser
 * registrados nas métricas ou nos traces.
 */

/**
 * Array de caminhos a serem excluídos da coleta de métricas e traces
 */
export const EXCLUDED_PATHS = [
  '/health',
  '/healthcheck',
  '/health-check',
  '/metrics',
  '/api-docs',
  '/swagger',
];

/**
 * Verifica se o caminho deve ser excluído da coleta de métricas e traces
 * @param path Caminho da requisição
 * @returns true se o caminho deve ser filtrado (não monitorado)
 */
export function shouldSkipMonitoring(path: string): boolean {
  // Verifica se o path está na lista de exclusões ou se começa com algum dos prefixos
  return EXCLUDED_PATHS.some(
    (excludedPath) =>
      path === excludedPath || path.startsWith(`${excludedPath}/`),
  );
}
