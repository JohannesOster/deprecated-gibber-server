import {UsersAdapter} from 'application/users/adapter';
import express from 'express';
import {body} from 'express-validator';

const adapter = UsersAdapter();
const router = express.Router();

router.post('/', [body('username').isString()], adapter.register);

export {router as routes};
