"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");
let HealthController = class HealthController {
    client;
    constructor(client) {
        this.client = client;
    }
    health() {
        return {
            service: 'api-gateway',
            status: 'ok',
            uptimeSeconds: Math.round(process.uptime()),
            environment: process.env.NODE_ENV ?? 'development',
        };
    }
    async services() {
        const targets = Object.entries(shared_1.SERVICE_TOKENS);
        const results = await Promise.all(targets.map(async ([name, token]) => {
            const startedAt = Date.now();
            try {
                // Every service answers this pattern; see HealthController in each.
                await this.client.send(token, 'health.ping', {});
                return { service: name.toLowerCase(), reachable: true, latencyMs: Date.now() - startedAt };
            }
            catch (error) {
                return {
                    service: name.toLowerCase(),
                    reachable: false,
                    latencyMs: Date.now() - startedAt,
                    reason: error instanceof Error ? error.message : 'Unknown error',
                };
            }
        }));
        return {
            allReachable: results.every((result) => result.reachable),
            services: results,
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)(),
    (0, response_interceptor_1.ResponseMessage)('Gateway is healthy'),
    (0, swagger_1.ApiOperation)({ summary: 'Liveness probe for the gateway process' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "health", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('services'),
    (0, response_interceptor_1.ResponseMessage)('Service health retrieved'),
    (0, swagger_1.ApiOperation)({
        summary: 'Readiness probe across all microservices',
        description: 'Pings every microservice over TCP and reports which are reachable. Useful for confirming gateway-to-microservice communication during setup.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "services", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [typeof (_a = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _a : Object])
], HealthController);
