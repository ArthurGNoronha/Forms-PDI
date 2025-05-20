import { Router } from 'express';

import {
    createReagente,
    getReagente,
    listReagentes,
    updateReagente,
    deleteReagente,
    updateStatus,
    listNamesAndCodes,
    addToStock,
    removeStock,
} from '../controllers/reagenteController.js';

import validator from '../middlewares/validator.js';
import schemaEdit from './validators/reagenteEditValidator.js';
import schema from './validators/reagenteValidator.js';

const router = Router();
router.get('/', listReagentes);
router.get('/:_id', getReagente);
router.post('/', validator(schema), createReagente);;
router.put('/:_id', validator(schemaEdit), updateReagente);
router.get('/forms', listNamesAndCodes);
router.delete('/:_id', deleteReagente);
router.patch('/:_id', updateStatus);
router.post('/add', addToStock);
router.post('/remove', removeStock);

export default router;