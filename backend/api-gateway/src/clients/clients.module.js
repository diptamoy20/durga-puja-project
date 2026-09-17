"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsModule = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const microservices_1 = require("@nestjs/microservices");
const microservice_client_1 = require("./microservice.client");
/**
 * Registers one TCP ClientProxy per microservice.
 *
 * Built with ClientProxyFactory rather than ClientsModule.register() so the
 * host/port come from ConfigService — that keeps every endpoint configurable
 * through .env instead of being hard-coded at module definition time.
 */
const endpointKeys = [
    ['auth', shared_1.SERVICE_TOKENS.AUTH],
    ['user', shared_1.SERVICE_TOKENS.USER],
    ['registration', shared_1.SERVICE_TOKENS.REGISTRATION],
    ['content', shared_1.SERVICE_TOKENS.CONTENT],
    ['gallery', shared_1.SERVICE_TOKENS.GALLERY],
    ['atlas', shared_1.SERVICE_TOKENS.ATLAS],
    ['events', shared_1.SERVICE_TOKENS.EVENTS],
    ['notification', shared_1.SERVICE_TOKENS.NOTIFICATION],
];
const clientProviders = endpointKeys.map(([key, token]) => ({
    provide: token,
    inject: [config_1.ConfigService],
    useFactory: (config) => {
        const endpoint = config.getOrThrow(`services.${key}`);
        return microservices_1.ClientProxyFactory.create({
            transport: microservices_1.Transport.TCP,
            options: { host: endpoint.host, port: endpoint.port },
        });
    },
}));
let ClientsModule = class ClientsModule {
};
exports.ClientsModule = ClientsModule;
exports.ClientsModule = ClientsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [...clientProviders, microservice_client_1.MicroserviceClient],
        exports: [...endpointKeys.map(([, token]) => token), microservice_client_1.MicroserviceClient],
    })
], ClientsModule);
