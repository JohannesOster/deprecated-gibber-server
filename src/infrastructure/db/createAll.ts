import {db} from './index';

db.exec(`CREATE TABLE IF NOT EXISTS user(
	userId TEXT PRIMARY KEY, 
	username TEXT NOT NULL
)`);

db.close();
