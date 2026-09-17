import { join } from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AtlasModule } from './atlas/atlas.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { ContentModule } from './content/content.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventsModule } from './events/events.module';
import { GalleryModule } from './gallery/gallery.module';
import gatewayConfig from './config/configuration';
import servicesConfig from './config/services.config';
import { validateEnv } from './config/env.validation';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RegistrationsModule } from './registrations/registrations.module';
import { RolesGuard } from './guards/roles.guard';
import { HealthController } from './health/health.controller';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [gatewayConfig, servicesConfig],
      validate: validateEnv,
      envFilePath: [join(__dirname, '..', '..', '.env')],
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: (config.get<number>('gateway.throttle.ttl') ?? 60) * 1000,
          limit: config.get<number>('gateway.throttle.limit') ?? 120,
        },
      ],
    }),

    // Registered globally so the guard can verify tokens without a TCP call.
    JwtModule.register({}),

    ClientsModule,
    AuthModule,
    UsersModule,
    DashboardModule,
    RegistrationsModule,
    ContentModule,
    GalleryModule,
    AtlasModule,
    EventsModule,
  ],
  controllers: [HealthController],
  providers: [
    /* Order matters: authentication before authorisation. Nest applies global
       guards in registration order, so JwtAuthGuard populates `req.user`
       before the two authorisation guards read it. */
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },

    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
