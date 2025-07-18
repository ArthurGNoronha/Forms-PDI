import UserAdm from '../models/userAdmModel.js';

export const login = async (req, res, next) => {
    /*
    #swagger.tags = ['Login']
    #swagger.responses[200]
    #swagger.responses[401]
    */
   try {
        const { login, senha } = req.body;

        const user = await UserAdm.findOne({ login });
        if(!user || user.status === false) {
            return res.unauthorized();
        }
        const isValid = await user.verifyPass(senha);
        if(!isValid) {
            return res.unauthorized();
        }
        req.user = user;
        next();
   } catch(err) {
    next(err);
   }
}

export const logOut = (req, res, next) => {
    /*
    #swagger.tags = ['Login']
    #swagger.responses[200]
    */
   try {
        res.clearCookie('token');
        res.ok();
   } catch(err) {
    next(err);
   }
}

export const createUserAdm = async (req, res, next) => {
    /*
    #swagger.tags = ['UserAdm']
    #swagger.requestBody = {
        required: true,
        schema: { $ref: '#/components/schemas/userAdm' }
    }
    #swagger.responses[201]
    */
   try {
    const { nome, login, senha } = req.body;

    await new UserAdm({
        nome,
        login: login.toLowerCase(),
        senha,
    }).save();

    res.created();
   } catch(err) {
    next(err);
   }
}

export const getUserAdm = async (req, res, next) => {
    /*
    #swagger.tags = ['UserAdm']
    #swagger.responses[200]
    */
    try {
        const user = await UserAdm.findOne(req.params);

        res.hateoasItem(user);
    } catch(err) {
        next(err);
    }
}

export const listUsersAdm = async (req, res, next) => {
    /*
    #swagger.tags = ['UserAdm']
    #swagger.responses[200]
    */
    try {
        const {_page, _size, _order, ...filter } = req.query;
        const page = parseInt(_page) || 1;
        const size = parseInt(_size) || 10;

        const offset = (page - 1) * size;

        const users = await UserAdm
            .find(filter)
            .skip(offset)
            .limit(size)
            .sort(_order);

        const totalData = await UserAdm.countDocuments();
        const totalPages = Math.ceil(totalData / size);

        res.hateoasList(users, totalPages);
    } catch(err) {
        next(err);
    }
}

export const updateUserAdm = async (req, res, next) => {
    /*
    #swagger.tags = ['UserAdm']
    #swagger.requestBody = {
        requred: true,
        schema: { $ref: '#/components/schemas/userAdm' }
    }
    #swagger.responses[200]
    */

    try {
        const { nome, login, senha } = req.body;

        const user = await UserAdm.updateOne(req.params, {
            nome,
            login: login.toLowerCase(),
            senha,
        }, {
            new: true,
        });

        res.hateoasItem(user);
    } catch(err) {
        next(err);
    }
}

export const deleteUserAdm = async (req, res, next) => {
    /*
    #swagger.tags = ['UserAdm']
    #swagger.responses[204]
    */
    try {
        await UserAdm.findOneAndDelete(req.params);

        res.noContent();
    } catch(err) {
        next(err);
    }
}

export const updateStatus = async (req, res, next) => {
    /*
    #swagger.tags = ['UserAdm']
    #swagger.responses[200]
    */
   try {
        const { status } = req.body;

        const user = await UserAdm.findOneAndUpdate(req.params, {
            status,
        }, {
            new: true,
        });

        res.hateoasItem(user);
    } catch(err) {
        next(err);
    }
}