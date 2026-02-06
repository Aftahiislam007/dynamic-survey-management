import 'reflect-metadata';
import { DataSource } from 'typeorm';
import configService from './ormconfig.service';

const dataSource = new DataSource(configService.getTypeOrmConfig() as any);

export default dataSource;
