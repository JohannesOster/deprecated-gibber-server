import {db} from './index';

db.run(`DROP TABLE user`);

db.close();
