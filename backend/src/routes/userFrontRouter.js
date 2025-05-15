import { Router } from "express";

const router = Router();

router.get('/login', (req, res) => {
    /*
    #swagger.ignore = true
    */
    res.render('login');
});

router.get('/', (req, res) => {
    /*
    #swagger.ignore = true
    */
    res.render('forms');
});

router.get('/envio', (req, res) => {
    /*
    #swagger.ignore = true
    */
    res.render('envio');
});

export default router;