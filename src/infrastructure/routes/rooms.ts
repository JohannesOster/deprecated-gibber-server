import {RoomsAdapter} from 'application/rooms/adapter';
import express from 'express';

const adapter = RoomsAdapter();
const router = express.Router();

router.get('/', adapter.list);

export {router as routes};
