import Reagente from '../models/ReagenteModel.js';

export const createReagente = async (req, res, next) => {
    /*
    #swagger.tags = ['Reagente']
    #swagger.requestBody = {
        required: true,
        schema: { $ref: '#/components/schemas/reagente' }
    }
    #swagger.responses[201]
    */
    try {
        const { codigo, reagente, quantidade, dataRecebido, unidadeMedida, valorUnitario, fornecedor, lote, validade, situacao, localizacao, armario, prateleira, solicitante, limiteMin, limiteMax } = req.body;

        const valorTotal = valorUnitario * quantidade;

        await new Reagente({
            codigo,
            reagente,
            quantidade,
            dataRecebido,
            unidadeMedida,
            valorUnitario,
            valorTotal,
            fornecedor,
            lote,
            validade,
            localizacao,
            armario,
            prateleira,
            solicitante,
            limiteMin,
            limiteMax,
            situacao
        }).save();

        res.created();
    } catch (err) {
        next(err);
    }
}

export const getReagente = async (req, res, next) => {
    /*
    #swagger.tags = ['Reagente']
    #swagger.responses[200]
    */
    try {
        const reagente = await Reagente.findOne(req.params);

        res.hateoasItem(reagente);
    } catch (err) {
        next(err);
    }
}

export const listReagentes = async (req, res, next) => {
    /*
    #swagger.tags = ['Reagente']
    #swagger.responses[200]
    */
    try {
        const {_page, _size, _order, ...filter } = req.query;
        const page = parseInt(_page) || 1;
        const size = parseInt(_size) || 10;

        const offset = (page - 1) * size;

        const reagentes = await Reagente
            .find(filter)
            .skip(offset)
            .limit(size)
            .sort(_order)

        const totalData = await Reagente.countDocuments();
        const totalPages = Math.ceil(totalData / size);

        res.hateoasList(reagentes, totalPages);
    } catch (err) {
        next(err);
    }
}

export const updateReagente = async (req, res, next) => {
    /*
    #swagger.tags = ['Reagente']
    #swagger.requestBody = {
        required: true,
        schema: { $ref: '#/components/schemas/reagente' }
    }
    #swagger.responses[200]
    */
   try {
        const { codigo, reagente, quantidade, dataRecebido, unidadeMedida, valorUnitario, fornecedor, lote, validade, situacao, localizacao, armario, prateleira, solicitante, limiteMin, limiteMax } = req.body;

        const valorTotal = valorUnitario * quantidade;

        const newReagente = await Reagente.findOneAndUpdate(req.params, {
            codigo,
            reagente,
            quantidade,
            dataRecebido,
            unidadeMedida,
            valorUnitario,
            valorTotal,
            fornecedor,
            lote,
            validade,
            localizacao,
            armario,
            prateleira,
            solicitante,
            limiteMin,
            limiteMax,
            situacao
        }, {
            new: true,
        });

        res.hateoasItem(newReagente);
   } catch (err) {
        next(err);
   }
}

export const deleteReagente = async (req, res, next) => {
    /*
    #swagger.tags = ['Reagente']
    #swagger.responses[204]
    */
    try {
        await Reagente.findOneAndDelete(req.params);

        res.noContent();
    } catch (err) {
        next(err);
    }
}

export const updateStatus = async (req, res, next) => {
    /*
    #swagger.tags = ['Reagente']
    #swagger.responses[200]
    */
   try {
        const { status } = req.body;

        const reagente = await Reagente.findOneAndUpdate(req.params, {
            status,
        }, {
            new: true,
        });

        res.hateoasItem(reagente);
   } catch (err) {
        next(err);
   }
}

export const listNamesAndCodes = async (req, res, next) => {
    /*
    #swagger.tags = ['Reagente']
    #swagger.responses[200]
    */
    try {
        const reagentes = await Reagente.find({ status: 1 }, { codigo: 1, reagente: 1, _id: 0 });

        res.ok(reagentes);
    } catch (err) {
        next(err);
    }
}

export const addToStock = async (req, res, next) => {
    /*
    #swagger.tags = ['Reagente']
    #swagger.responses[200]
    */
    try {
        let { quantidade, codigo } = req.body;

        const reagente = await Reagente.findOne({ codigo });

        quantidade = parseFloat(quantidade);
        
        const newReagente = await Reagente.findOneAndUpdate(
            { codigo },
            {
                $inc: { quantidade: +quantidade },
                $set: { valorTotal: reagente.valorUnitario * (reagente.quantidade + quantidade) }
            },
            { new: true }
        );

        res.hateoasItem(newReagente);
    } catch(err) {
        next(err);
    }
}

export const removeStock = async (req, res, next) => {
    /*
    #swagger.tags = ['Reagente']
    #swagger.responses[200]
    */
    try {
        let { quantidade, codigo } = req.body;

        const reagente = await Reagente.findOne({ codigo });

        quantidade = parseFloat(quantidade);

        const newReagente = await Reagente.findOneAndUpdate(
            { codigo },
            {
                $inc: { quantidade: -quantidade },
                $set: { valorTotal: reagente.valorUnitario * (reagente.quantidade - quantidade) }
            },
            { new: true }
        );

        res.hateoasItem(newReagente);
    } catch(err) {
        next(err);
    }
}