import { SERVICE_TOKENS } from '@dpgc/shared';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

import { ServiceEndpoint } from '../config/services.config';
import { MicroserviceClient } from './microservice.client';

/**
 * Registers one TCP ClientProxy per microservice.
 *
 * Built with ClientProxyFactory rather than ClientsModule.register() so the
 * host/port come from ConfigService — that keeps every endpoint configurable
 * through .env instead of being hard-coded at module definition time.
 */
const endpointKeys = [
  ['auth', SERVICE_TOKENS.AUTH],
  ['user', SERVICE_TOKENS.USER],
  ['registration', SERVICE_TOKENS.REGISTRATION],
  ['content', SERVICE_TOKENS.CONTENT],
  ['gallery', SERVICE_TOKENS.GALLERY],
  ['atlas', SERVICE_TOKENS.ATLAS],
  ['events', SERVICE_TOKENS.EVENTS],
  ['notification', SERVICE_TOKENS.NOTIFICATION],
] as const;

const clientProviders = endpointKeys.map(([key, token]) => ({
  provide: token,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const endpoint = config.getOrThrow<ServiceEndpoint>(`services.${key}`);

    return ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host: endpoint.host, port: endpoint.port },
    });
  },
}));

@Global()
@Module({
  imports: [ConfigModule],
  providers: [...clientProviders, MicroserviceClient],
  exports: [...endpointKeys.map(([, token]) => token), MicroserviceClient],
})
export class ClientsModule {}
