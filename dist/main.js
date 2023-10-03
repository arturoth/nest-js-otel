"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tracer_1 = require("./tracer");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    await tracer_1.default.start();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await app.listen(process.env.APP_PORT && Number.isInteger(+process.env.APP_PORT)
        ? +process.env.APP_PORT
        : 8080);
}
bootstrap();
//# sourceMappingURL=main.js.map