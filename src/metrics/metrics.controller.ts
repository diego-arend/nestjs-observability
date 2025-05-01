import { Controller } from '@nestjs/common';

@Controller()
export class MetricsController {
  // O endpoint /metrics é automaticamente fornecido pelo PrometheusModule
  // Não precisamos implementar nada aqui
}
