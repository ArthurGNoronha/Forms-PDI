import jsonwebtoken from 'jsonwebtoken';

export const generate = (req, res, next) => {
    if(!req.user) {
        return res.unauthorized();
    }

    const payload =  {
        login: req.user.login,
    };

    const JWTSECRET = process.env.JWTSECRET || 'default';
    const JWTEXPIRE = process.env.JWTEXPIRE;

    const token = jsonwebtoken.sign(payload, JWTSECRET, {
        expiresIn: JWTEXPIRE,
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.JWTSECRET,
        maxAge: 24 * 60 * 60 * 1000,
    });

    return res.ok({ token });
}

export const verify = (req, res, next) => {
    /*
    #swagger.autoHeaders = false
    #swagger.security = [{
        "bearerAuth": {}
    }]
    */
    if(req.originalUrl === '/api/reagentes/forms' && req.method === 'GET' || req.baseurl === '/api/answers' && req.method === 'POST') {
        return next();
    }
    
    const authHeader = req.headers.authorization;

    if (!!authHeader) {
        const tokenParts = authHeader.split(' ');
        if (tokenParts.length === 2 && tokenParts[0] === 'Bearer') {
            const token = tokenParts[1];
            const JWTSECRET = process.env.JWTSECRET || 'default';

            return jsonwebtoken.verify(token, JWTSECRET, (err, payload) => {
                if (err) return res.unauthorized();
                req.payload = payload;
                return next();
            });
        }
    }

    return res.unauthorized();
};