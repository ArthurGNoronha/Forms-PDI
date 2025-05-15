import { Router } from 'express';

const router = Router();

router.get('/', (req, res, next) => {
    /*
    #swagger.ignore = true
    */
    try {
        if(!req.cookies.token || !req.cookies) {
            return res.redirect('/login');
        }
        return res.render('adm');
    } catch(err) {
        next(err);
    }
});

export default router;