import { Router } from 'express';

import { 
    sendAnswer,
    getAnswers,
    listAnswers,
    deleteAnswer,
    createExcel,
} from '../controllers/answerController.js';

import validator from '../middlewares/validator.js';
import schema from './validators/answerValidator.js';

const router = Router();
router.get('/', listAnswers);
router.get('/excel', createExcel);
router.get('/:_id', getAnswers);
router.post('/', validator(schema), sendAnswer);
router.delete('/:_id', deleteAnswer);

export default router;