import { Router } from 'express';

import {
    createUserAdm,
    getUserAdm,
    listUsersAdm,
    updateUserAdm,
    deleteUserAdm,
    updateStatus
} from '../controllers/userAdmController.js';

import validator from '../middlewares/validator.js';
import schema from './validators/userAdmValidator.js';

const router = Router();
router.get('/', listUsersAdm);
router.get('/:_id', getUserAdm);
router.post('/', validator(schema), createUserAdm);
router.put('/:_id', validator(schema), updateUserAdm);
router.delete('/:_id', deleteUserAdm);
router.patch('/:_id', updateStatus);

export default router;