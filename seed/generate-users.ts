import * as dotenv from 'dotenv';
import { AppDataSource, createDataSource } from '../src/data-source';
import { createRandomUsers } from './users-faker';

dotenv.config({ path: './test.env' });

async function generateUsers(numberOfUsers: number) {
  await createDataSource();
  await AppDataSource.initialize();
  createRandomUsers(numberOfUsers);
}

generateUsers(50);
