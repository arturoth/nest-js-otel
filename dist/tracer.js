'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const exporter_trace_otlp_http_1 = require("@opentelemetry/exporter-trace-otlp-http");
const resources_1 = require("@opentelemetry/resources");
const opentelemetry = require("@opentelemetry/sdk-node");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const exporterOptions = {
    url: `${process.env.OTLP_COLLECTOR}/v1/traces`,
};
const traceExporter = new exporter_trace_otlp_http_1.OTLPTraceExporter(exporterOptions);
const sdk = new opentelemetry.NodeSDK({
    traceExporter,
    instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)()],
    resource: new resources_1.Resource({
        [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: 'nest-js-otel-local',
    }),
});
sdk.start();
process.on('SIGTERM', () => {
    sdk
        .shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.log('Error terminating tracing', error))
        .finally(() => process.exit(0));
});
exports.default = sdk;
//# sourceMappingURL=tracer.js.map