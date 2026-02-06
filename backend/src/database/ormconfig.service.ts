import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { Entity } from 'typeorm';
import { DynamicModule } from '@nestjs/common';

dotenv.config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.env.DB_HOST,
      port: Number(this.env.DB_PORT),
      username: this.env.DB_USERNAME,
      password: this.env.DB_PASSWORD,
      database: this.env.DB_NAME,
      logging: false,

      entities: [__dirname + '/../**/*.entity{.ts,.js}'],

      migrationsTableName: 'migration',
      migrations: [join(__dirname, '..', 'migrations', '*.ts')],

      synchronize: true,
    };
  }
}

const configService = new ConfigService(process.env);

export default configService;
