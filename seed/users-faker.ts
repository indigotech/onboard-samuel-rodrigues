import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { hashSync } from 'bcrypt';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import { startServer } from '../src/start-server';

dotenv.config({ path: './test.env' });
startServer();

faker.locale = 'pt_BR';

function createRandomUser(): User {
  const user = new User();
  user.id = faker.datatype.uuid();
  user.name = faker.internet.userName();
  user.email = faker.internet.email(user.name);
  user.password = hashSync(faker.internet.password(), 8);
  user.birthdate = faker.date.birthdate({ min: 14, max: 80, mode: 'age' }).toString();

  return user;
}

async function createRandomUsers(numberOfUsers: number) {
  await AppDataSource.initialize();

  for (let i = 0; i < numberOfUsers; i++) {
    await User.save(createRandomUser());
  }
}

createRandomUsers(50);
