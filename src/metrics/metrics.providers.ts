import {
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

export const metricsProviders = [
  makeCounterProvider({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'statusCode'],
  }),
  makeHistogramProvider({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'path', 'statusCode'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  }),
  makeCounterProvider({
    name: 'app_events_total',
    help: 'Total number of application events',
    labelNames: ['event', 'status'],
  }),
  makeCounterProvider({
    name: 'app_errors_total',
    help: 'Total number of application errors',
    labelNames: ['source', 'errorType'],
  }),
];
