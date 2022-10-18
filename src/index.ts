import * as dotenv from 'dotenv';
import { startServer } from './start-server';

dotenv.config({ path: `${process.cwd()}/.env` });

startServer();
