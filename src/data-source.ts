import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';

export let AppDataSource: DataSource;

export function createDataSource() {
  AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: String(process.env.POSTGRES_PASSWORD),
    database: process.env.POSTGRES_DB,
    synchronize: true,
    logging: false,
    entities: [User],
    subscribers: [],
    migrations: [],
  });
}
