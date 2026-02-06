import { LoggerModule } from 'nestjs-pino';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configService from './database/ormconfig.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SurveysModule } from './modules/surveys/surveys.module';
import { FieldsModule } from './modules/fields/fields.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';


const logsFolderPath = 'logs';

// Ensure the logs folder exists, create it if not
if (!fs.existsSync(logsFolderPath)) {
  fs.mkdirSync(logsFolderPath);
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      cache: true,
    }),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    ThrottlerModule.forRootAsync({
      useFactory: async () => ({
        throttlers: [
          {
            ttl:
              parseInt(process.env.RATE_LIMITER_TIME_TO_LEAVE || '60000', 10) ||
              60000, // default to 60000 if env variable not present
            limit: parseInt(process.env.RATE_LIMITER_MAX_TRY || '60', 10) || 60, // default to 60 if env variable not present
          },
        ],
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
      exclude: ['/uploads/{*splat}'],
    }),
    TypeOrmModule.forFeature([]),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        redact: {
          paths: [
            'req.headers',
            'res.headers',
            'req.remoteAddress',
            'req.remotePort',
          ],
          remove: true,
        },
        transport: {
          target: 'pino/file',
          options: {
            // Specify the log file path
            destination: `${logsFolderPath}/app.log`, // Change this to your desired log file path
          },
        },
      },
    }),
    AuthModule,
    UsersModule,
    SurveysModule,
    FieldsModule,
    SubmissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Apply to all routes
  }
}
