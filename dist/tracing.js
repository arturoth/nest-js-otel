"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otelSDK = void 0;
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const sdk_node_1 = require("@opentelemetry/sdk-node");
const process = require("process");
const instrumentation_http_1 = require("@opentelemetry/instrumentation-http");
const instrumentation_express_1 = require("@opentelemetry/instrumentation-express");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const exporter_trace_otlp_proto_1 = require("@opentelemetry/exporter-trace-otlp-proto");
const exporter_metrics_otlp_proto_1 = require("@opentelemetry/exporter-metrics-otlp-proto");
const sdk_metrics_1 = require("@opentelemetry/sdk-metrics");
const exporter_prometheus_1 = require("@opentelemetry/exporter-prometheus");
const host_metrics_1 = require("@opentelemetry/host-metrics");
const exporter = new exporter_prometheus_1.PrometheusExporter({ port: 9464 }, () => {
    console.log('prometheus scrape endpoint: http://localhost:9464/metrics');
});
const meterProvider = new sdk_metrics_1.MeterProvider();
meterProvider.addMetricReader(exporter);
const hostMetrics = new host_metrics_1.HostMetrics({
    meterProvider,
    name: 'nest-js-otel-metrics-prometheus',
});
hostMetrics.start();
const traceExporter = new exporter_trace_otlp_proto_1.OTLPTraceExporter({
    url: `${process.env.OTLP_COLLECTOR}/v1/traces`,
    concurrencyLimit: 10,
});
const metricExporter = new exporter_metrics_otlp_proto_1.OTLPMetricExporter({
    url: `${process.env.OTLP_COLLECTOR}/v1/metrics`,
    temporalityPreference: sdk_metrics_1.AggregationTemporality.DELTA,
});
exports.otelSDK = new sdk_node_1.NodeSDK({
    resource: new resources_1.Resource({
        [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: `nest-js-otel-local`,
        [semantic_conventions_1.SemanticResourceAttributes.SERVICE_VERSION]: `0.0.1`,
        [semantic_conventions_1.SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || '',
    }),
    metricReader: new sdk_metrics_1.PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 3000,
    }),
    autoDetectResources: true,
    spanProcessor: new sdk_trace_base_1.SimpleSpanProcessor(traceExporter),
    instrumentations: [
        new instrumentation_http_1.HttpInstrumentation(),
        new instrumentation_express_1.ExpressInstrumentation(),
        (0, auto_instrumentations_node_1.getNodeAutoInstrumentations)(),
    ],
});
exports.otelSDK.start();
process.on('SIGTERM', () => {
    exports.otelSDK
        .shutdown()
        .then(() => console.log('SDK shut down successfully'), (err) => console.log('Error shutting down SDK', err))
        .finally(() => process.exit(0));
});
//# sourceMappingURL=tracing.js.map