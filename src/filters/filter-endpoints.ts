/**
 * Utilitário para filtrar endpoints de manutenção que não devem ser
 * registrados nas métricas ou nos traces.
 */

/**
 * Array de caminhos a serem excluídos da coleta de métricas e traces
 */
export const EXCLUDED_PATHS = [
  '/metrics',
  '/health',
  '/healthcheck',
  '/api-docs',
  '/swagger-ui',
  '/favicon.ico',
  '/internal-metrics',
  '/internal-metrics-disabled',
];

/**
 * Verifica se um caminho deve ser ignorado para monitoramento
 * @param path O caminho a ser verificado
 * @returns true se o caminho deve ser ignorado, false caso contrário
 */
export function shouldSkipMonitoring(path: string): boolean {
  // Certifique-se de que o path comece com uma barra
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Verificar caminhos exatos
  if (EXCLUDED_PATHS.includes(normalizedPath)) {
    return true;
  }

  // Verificar prefixos de caminho
  for (const excludedPath of EXCLUDED_PATHS) {
    if (normalizedPath.startsWith(excludedPath + '/')) {
      return true;
    }
  }

  return false;
}
