import Answer from '../models/answerModel.js';
import Reagente from '../models/ReagenteModel.js';

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
        const { responsavel, codigo, reagente, medida, observacao } = req.body;
        let { quantidade } = req.body;
        const data = new Date();

        const reagenteModel = await Reagente.findOne({ codigo, reagente });
        if(!reagenteModel) return next({ message: 'Reagente não encontrado' });

        await new Answer({
            responsavel,
            codigo,
            reagente,
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
        const {_page, _size, _order, ...filter } = req.query;
        const page = parseInt(_page) || 1;
        const size = parseInt(_size) || 10;

        const offset = (page - 1) * size;

        const answers = await Answer
            .find(filter)
            .skip(offset)
            .limit(size)
            .sort(_order)

        const totalData = await Answer.countDocuments();
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