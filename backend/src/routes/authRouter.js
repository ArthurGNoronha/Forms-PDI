import { Router } from 'express';

import validator from '../middlewares/validator.js';
import authValidator from './validators/authValidator.js';

import { login } from '../controllers/userAdmController.js';
import { generate } from '../controllers/authController.js';

const router = Router();

router.post('/', validator(authValidator));
router.post('/', login, generate);

export default router;