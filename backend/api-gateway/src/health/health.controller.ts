import { Public, SERVICE_TOKENS } from '@dpgc/shared';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { MicroserviceClient } from '../clients/microservice.client';
import { ResponseMessage } from '../interceptors/response.interceptor';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly client: MicroserviceClient) {}

  @Public()
  @Get()
  @ResponseMessage('Gateway is healthy')
  @ApiOperation({ summary: 'Liveness probe for the gateway process' })
  health() {
    return {
      service: 'api-gateway',
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      environment: process.env.NODE_ENV ?? 'development',
    };
  }

  @Public()
  @Get('services')
  @ResponseMessage('Service health retrieved')
  @ApiOperation({
    summary: 'Readiness probe across all microservices',
    description:
      'Pings every microservice over TCP and reports which are reachable. Useful for confirming gateway-to-microservice communication during setup.',
  })
  async services() {
    const targets = Object.entries(SERVICE_TOKENS) as Array<
      [string, (typeof SERVICE_TOKENS)[keyof typeof SERVICE_TOKENS]]
    >;

    const results = await Promise.all(
      targets.map(async ([name, token]) => {
        const startedAt = Date.now();

        try {
          // Every service answers this pattern; see HealthController in each.
          await this.client.send(token, 'health.ping', {});
          return { service: name.toLowerCase(), reachable: true, latencyMs: Date.now() - startedAt };
        } catch (error) {
          return {
            service: name.toLowerCase(),
            reachable: false,
            latencyMs: Date.now() - startedAt,
            reason: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }),
    );

    return {
      allReachable: results.every((result) => result.reachable),
      services: results,
    };
  }
}
