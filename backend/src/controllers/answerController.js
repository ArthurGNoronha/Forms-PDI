import Answer from '../models/answerModel.js';
import Reagente from '../models/reagenteModel.js';

export const sendAnswer = async (req, res, next) => {
    /*
    #swagger.tags = ['Answer']
    #swagger.requestBody = {
        required: true,
        schema: { $ref: '#/components/schemas/answer' }
    }
    #swagger.responses[201]
    */
    try {
        const { responsavel, codigo, reagente, lote, medida, observacao } = req.body;
        let { quantidade } = req.body;
        const data = new Date();

        const reagenteModel = await Reagente.findOne({ codigo, reagente });
        if(!reagenteModel) return next({ message: 'Reagente não encontrado' });

        await new Answer({
            responsavel,
            codigo,
            reagente,
            lote,
            quantidade,
            medida,
            observacao,
            data
        }).save();

        quantidade = parseFloat(quantidade);

        await reagenteModel.updateOne(
            { 
                $inc: { quantidade: -quantidade },
                $set: { valorTotal: reagenteModel.valorUnitario * (reagenteModel.quantidade - quantidade) }
            },
            { new: true }
        );

        res.created();
    } catch(err) {
        next(err);
    }
}

export const getAnswers = async (req, res, next) => {
    /*
    #swagger.tags = ['Answer']
    #swagger.responses[200]
    */
    try {
        const answer = await Answer.findOne(req.params);

        res.hateoasItem(answer);
    } catch (err) {
        next(err);
    }
}

export const listAnswers = async (req, res, next) => {
    /*
    #swagger.tags = ['Answer']
    #swagger.responses[200]
    */
    try {
        const {_page, _size, filter } = req.query;
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
            'responsavel', 'codigo', 'reagente'
        ];
        const dateFields = [
            'data'
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

        const answers = await Answer
            .find(filterObj)
            .skip(offset)
            .limit(size)
            .sort(order)

        const totalData = await Answer.countDocuments(filterObj);
        const totalPages = Math.ceil(totalData / size);

        res.hateoasList(answers, totalPages);
    } catch(err) {
        next(err);
    }
}

export const deleteAnswer = async (req, res, next) => {
    /*
    #swagger.tags = ['Answer']
    #swagger.responses[204]
    */
    try {
        await Answer.deleteOne(req.params);

        res.noContent();
    } catch (err) {
        next(err);
    }
}