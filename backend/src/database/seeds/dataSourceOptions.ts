import { DataSource } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false,

  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],

  migrationsTableName: 'migration',
  migrations: [join(__dirname, '..', 'migrations', '*.ts')],

  synchronize: true,
});
