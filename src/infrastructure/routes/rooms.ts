import {RoomsAdapter} from 'application/rooms/adapter';
import express from 'express';
import {body} from 'express-validator';

const adapter = RoomsAdapter();
const router = express.Router();

router.get('/', adapter.list);
router.post('/', [body('roomTitle').isString()], adapter.create);

export {router as routes};
