import Reagente from '../models/reagenteModel.js';

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
        const { codigo, reagente, quantidade, dataRecebido, unidadeMedida, valorUnitario, fornecedor, lote, validade, situacao, localizacao, limiteMin, limiteMax } = req.body;

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
        let reagente = await Reagente.findOne(req.params);

        reagente._doc.nearLimit = reagente.quantidade <= (reagente.limiteMin * 1.2);

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
        let { _page, _size, filter } = req.query;
        const order = req.order;
        const page = parseInt(_page) || 1;
        const size = parseInt(_size) || 10;

        const offset = (page - 1) * size;

        let filterObj = {};
        if (filter) {
            filter.split(',').forEach(pair => {
                const [key, value] = pair.split('=');
                if (key && value) filterObj[key] = value;
            });
        }
        filterObj = { ...filterObj };

        const fields = [
            'codigo', 'reagente', 'unidadeMedida', 'situacao', 'fornecedor', 'localizacao'
        ];
        const dateFields = [
            'dataRecebido', 'validade'
        ];
        Object.keys(filterObj).forEach(key => {
            if (fields.includes(key)) {
                filterObj[key] = { $regex: filterObj[key], $options: 'i' };
            } else if( dateFields.includes(key)) {
                const [day, month, year] = filterObj[key].split('/');
                if(day && month && year) {
                    const start = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
                    const end = new Date(`${year}-${month}-${day}T23:59:59.999Z`);
                    filterObj[key] = { $gte: start, $lte: end };
                } else {
                    filterObj[key] = '';
                }
            }
        });

        let reagentes = await Reagente
            .find(filterObj)
            .skip(offset)
            .limit(size)
            .sort(order);

        reagentes = reagentes.map(reagente => {
            reagente._doc.nearLimit = reagente.quantidade <= (reagente.limiteMin * 1.2);
            return reagente;
        });

        const totalData = await Reagente.countDocuments(filterObj);
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
        const { codigo, reagente, quantidade, dataRecebido, unidadeMedida, valorUnitario, fornecedor, lote, validade, situacao, localizacao, limiteMin, limiteMax } = req.body;

        const valorTotal = valorUnitario * quantidade || await Reagente.findOne(req.params).valorTotal;

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

        res.ok({reagentes: reagentes});
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