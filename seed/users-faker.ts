import { faker } from '@faker-js/faker';
import { hashSync } from 'bcrypt';
import { Address } from '../src/entity/Address';
import { User } from '../src/entity/User';

faker.locale = 'pt_BR';

export function createRandomAddress(): Address {
  const address = new Address();
  address.postalCode = faker.address.zipCode('#####-###');
  address.street = faker.address.street();
  address.streetNumber = Number(faker.address.buildingNumber());
  address.complement = faker.address.secondaryAddress();
  address.neighborhood = faker.address.county();
  address.city = faker.address.cityName();
  address.state = faker.address.state();

  return address;
}

function createRandomUser(): User {
  const user = new User();
  user.id = faker.datatype.uuid();
  user.name = faker.internet.userName();
  user.email = faker.internet.email(user.name);
  user.password = hashSync(faker.internet.password(), 8);
  user.birthdate = faker.date.birthdate({ min: 14, max: 80, mode: 'age' }).toString();
  user.addresses = [createRandomAddress(), createRandomAddress()];

  return user;
}

export async function createRandomUsers(numberOfUsers: number) {
  const users: User[] = [];

  for (let i = 0; i < numberOfUsers; i++) {
    users.push(createRandomUser());
  }

  return User.save(users);
}
