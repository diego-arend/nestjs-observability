import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';

@Injectable()
export class AppService {
  constructor(private readonly logger: LoggerService) {}

  getHello(): string {
    // Simula algum trabalho para demonstrar métricas de duração
    this.simulateWork();
    this.logger.log('Hello service executed', 'AppService');
    return 'Hello World!';
  }

  private simulateWork(): void {
    // Simula uma carga de trabalho aleatória
    const delay = Math.floor(Math.random() * 200); // 0-200ms
    const start = Date.now();
    while (Date.now() - start < delay) {
      // Busy wait para simular trabalho
    }
  }
}
