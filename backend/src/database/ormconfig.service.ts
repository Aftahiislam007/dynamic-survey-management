import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

class ConfigService {
    constructor(private env: { [k: string]: string | undefined }) { }

    private getEnvVar(key: string, required = true): string {
        const value = this.env[key];
        if (required && (!value || value.trim() === '')) {
            throw new Error(`Environment variable ${key} is not set or empty`);
        }
        return value || '';
    }

    public getTypeOrmConfig(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: this.getEnvVar('DB_HOST'),
            port: Number(this.getEnvVar('DB_PORT')),
            username: this.getEnvVar('DB_USERNAME'),
            password: this.getEnvVar('DB_PASSWORD'), // guaranteed to be string
            database: this.getEnvVar('DB_NAME'),

            logging: this.env.NODE_ENV === 'development' ? 'all' : false,

            entities: [
                __dirname + '/../**/*.entity{.ts,.js}',
            ],

            migrationsTableName: 'migration',
            migrations: [join(__dirname, '..', 'migrations', '*.ts')],
            migrationsRun: false,

            synchronize: true,
        };
    }
}

const configService = new ConfigService(process.env);

export default configService;
