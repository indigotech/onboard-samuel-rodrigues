import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { User } from './entity/User';

AppDataSource.initialize()
  .then(async () => {
    const user = new User();
    user.name = 'Jonh Doe';
    user.email = 'john.doe@email.com';
    user.password = 'senha123';
    user.birthdate = '01-01-2000';
    await AppDataSource.manager.save(user);

    const users = await AppDataSource.manager.find(User);
    console.log(users);
  })
  .catch((error) => console.log(error));
