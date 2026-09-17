"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('user', () => ({
    host: process.env.USER_SERVICE_HOST ?? 'localhost',
    port: Number(process.env.USER_SERVICE_PORT ?? 5002),
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
}));
