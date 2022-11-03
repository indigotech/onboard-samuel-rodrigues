import { faker } from '@faker-js/faker';
import { hashSync } from 'bcrypt';
import { User } from '../src/entity/User';

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

export async function createRandomUsers(numberOfUsers: number) {
  const users: User[] = [];

  for (let i = 0; i < numberOfUsers; i++) {
    users.push(createRandomUser());
  }

  await User.save(users);
}
