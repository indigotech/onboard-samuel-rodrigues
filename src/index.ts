import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { User } from './entity/User';

AppDataSource.initialize()
  .then(async () => {
    const user = new User();
    user.firstName = 'Jonh';
    user.lastName = 'Doe';
    user.isActive = true;
    await AppDataSource.manager.save(user);

    const users = await AppDataSource.manager.find(User);
    console.log(users);
  })
  .catch((error) => console.log(error));
