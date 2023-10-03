import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import * as process from 'process';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import {
  PeriodicExportingMetricReader,
  AggregationTemporality,
  MeterProvider,
} from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { HostMetrics } from '@opentelemetry/host-metrics';

const exporter = new PrometheusExporter({ port: 9464 }, () => {
  console.log('prometheus scrape endpoint: http://localhost:9464/metrics');
});
// Creates MeterProvider and installs the exporter as a MetricReader
const meterProvider = new MeterProvider();
meterProvider.addMetricReader(exporter);

const hostMetrics = new HostMetrics({
  meterProvider,
  name: 'nest-js-otel-metrics-prometheus',
});
hostMetrics.start();

const traceExporter = new OTLPTraceExporter({
  url: `${process.env.OTLP_COLLECTOR}/v1/traces`,
  concurrencyLimit: 10,
});

const metricExporter = new OTLPMetricExporter({
  url: `${process.env.OTLP_COLLECTOR}/v1/metrics`,
  temporalityPreference: AggregationTemporality.DELTA,
});

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: `nest-js-otel-local`, // update this to a more relevant name for you!
    [SemanticResourceAttributes.SERVICE_VERSION]: `0.0.1`,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
      process.env.NODE_ENV || '',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 3000,
  }),
  autoDetectResources: true,
  spanProcessor: new SimpleSpanProcessor(traceExporter),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    getNodeAutoInstrumentations(),
  ],
});

otelSDK.start();

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});
