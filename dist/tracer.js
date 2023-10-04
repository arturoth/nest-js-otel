"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const exporter_trace_otlp_http_1 = require("@opentelemetry/exporter-trace-otlp-http");
const exporter_metrics_otlp_proto_1 = require("@opentelemetry/exporter-metrics-otlp-proto");
const sdk_node_1 = require("@opentelemetry/sdk-node");
const sdk_trace_node_1 = require("@opentelemetry/sdk-trace-node");
const sdk_metrics_1 = require("@opentelemetry/sdk-metrics");
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
class Tracer {
    constructor() {
        this.sdk = null;
        this.exporter = new exporter_trace_otlp_http_1.OTLPTraceExporter({
            url: `${process.env.OTLP_COLLECTOR}/v1/traces`,
        });
        this.metricExporter = new exporter_metrics_otlp_proto_1.OTLPMetricExporter({
            url: `${process.env.OTLP_COLLECTOR}/v1/metrics`,
            temporalityPreference: sdk_metrics_1.AggregationTemporality.DELTA,
        });
        this.provider = new sdk_trace_node_1.BasicTracerProvider({
            resource: new resources_1.Resource({
                [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: 'nest-js-otel-local',
            }),
        });
    }
    init() {
        try {
            this.provider.addSpanProcessor(new sdk_trace_node_1.SimpleSpanProcessor(new sdk_trace_node_1.ConsoleSpanExporter()));
            this.provider.addSpanProcessor(new sdk_trace_node_1.SimpleSpanProcessor(this.exporter));
            this.provider.register();
            this.sdk = new sdk_node_1.NodeSDK({
                traceExporter: this.exporter,
                metricReader: new sdk_metrics_1.PeriodicExportingMetricReader({
                    exporter: this.metricExporter,
                    exportIntervalMillis: 3000,
                }),
                instrumentations: [
                    (0, auto_instrumentations_node_1.getNodeAutoInstrumentations)({
                        '@opentelemetry/instrumentation-fs': { enabled: false },
                    }),
                ],
            });
            this.sdk.start();
            console.info('The tracer has been initialized');
        }
        catch (e) {
            console.error('Failed to initialize the tracer', e);
        }
    }
}
exports.default = new Tracer();
//# sourceMappingURL=tracer.js.map