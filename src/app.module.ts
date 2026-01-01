import { MiddlewareConsumer, Module, ValidationPipe, NestMiddleware } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; 
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { User } from './users/user.entity';
import { Report } from './reports/report.entity';
import { AuthGuard } from "src/guards/auth.guard";
import { AuthModule } from './auth/auth.module';
import { TagsModule } from './tags/tags.module';
import { Tag } from './tags/tag.entity';
import { winstonConfig } from './config/logger.config';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { HealthModule } from './health/health.module';
import { MonitoringTestModule } from './monitoring-test/monitoring-test.module';
const cookieSession = require('cookie-session');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    
    WinstonModule.forRoot(winstonConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') || 'localhost',
        port: configService.get('DB_PORT') || 5432,
        username: configService.get('DB_USER') || 'mycv_user',
        password: configService.get('DB_PASSWORD') || 'mycv_password',
        database: configService.get('DB_NAME') || 'mycv_db',
        entities: [User, Report, Tag],
        migrations: ['dist/database/migrations/**/*{.ts,.js}'],
        migrationsTableName: 'migrations',
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ReportsModule,
    AuthModule,
    TagsModule,
    HealthModule,
    MonitoringTestModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      })
    }
  ],
})
export class AppModule {
  constructor(
    private configService: ConfigService
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: [this.configService.get('COOKIE_KEY')],
        }),
        // ✅ NEW: HTTP Logger Middleware
        HttpLoggerMiddleware,
      )
      .forRoutes('*');
  }
}