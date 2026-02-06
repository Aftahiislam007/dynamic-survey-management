import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { json } from 'express';
import morgan from 'morgan';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
    rawBody: true,
  });

  // Increase the body parser limits
  app.use(json({ limit: '50mb' }));
  app.use(
    compression({
      threshold: 2048, // set the threshold to bytes . 2048 bytes = 2kb
    }),
  );

  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
    prefix: '/uploads', // This is the URL prefix for your static files
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const prefix = configService.get('API_GLOBAL_PREFIX', 'api');
  app.setGlobalPrefix(prefix);
  // app.setGlobalPrefix(process.env.API_GLOBAL_PREFIX || 'api');

  app.use(morgan('combined'));
  // const logger = app.get(Logger);
  // app.useLogger(logger);
  app.useLogger(new Logger());

  const apiOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };

  app.enableCors(apiOptions);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const options = new DocumentBuilder()
    .setTitle('Dynamic Survey Management System Project API Docs')
    .setDescription('Dynamic Survey Management System API description')
    .setVersion('1.0')
    .addServer('/')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      showRequestDuration: true,
      docExpansion: 'none', // This makes all sections collapsed by default
    },
  });

  // security
  // setupSecurity(app)
  // await app.listen(process.env.SERVER_PORT);

  await app.listen(process.env.PORT ?? 3000);
  logger.log(
    `Server is running on ${process.env.API_URL}:${process.env.PORT ?? 3000}`,
  );
  logger.log(
    `Swagger UI is available on ${process.env.API_URL}:${process.env.PORT ?? 3000}/docs`,
  );
}
bootstrap();
