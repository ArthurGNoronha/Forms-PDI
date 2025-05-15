export default (req, res, next) => {
    /*
    #swagger.ignore = true
    */
    if(!!req.query._order) {
        const [field, direction] = req.query._order.split(' ');

        req.query._order = {
            [field]: direction?.toLowerCase() == 'desc' ? -1 : 1
        };
    }

    next();
}