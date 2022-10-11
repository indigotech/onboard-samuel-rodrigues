import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '1998',
  database: 'local-docker',
  synchronize: true,
  logging: false,
  entities: [User],
  subscribers: [],
  migrations: [],
});
