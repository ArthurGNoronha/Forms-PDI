import Answer from '../models/answerModel.js';
import Reagente from '../models/reagenteModel.js';
import exceljs from 'exceljs';

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

export const createExcel = async (req, res, next) => {
    /*
    #swagger.ignore = true
    */
    try {
        const answers = await Answer.find();

        const grouped = {};
        answers.forEach(answer => {
            const date = new Date(answer.data);
            const month = date.toLocaleString('pt-BR', { month: 'long' });
            const year = date.getFullYear();
            const key = `${month.charAt(0).toUpperCase() + month.slice(1)}_${year}`;
            if(!grouped[key]) grouped[key] = [];
            grouped[key].push(answer);
        });

        const workbook = new exceljs.Workbook();

        Object.entries(grouped).forEach(([sheetName, items]) => {
            const worksheet = workbook.addWorksheet(sheetName);

            worksheet.columns = [
                { header: 'Responsável', key: 'responsavel', width: 30 },
                { header: 'Código', key: 'codigo', width: 15 },
                { header: 'Reagente', key: 'reagente', width: 20 },
                { header: 'Lote', key: 'lote', width: 15 },
                { header: 'Quantidade', key: 'quantidade', width: 15 },
                { header: 'Medida', key: 'medida', width: 10 },
                { header: 'Observação', key: 'observacao', width: 30 },
                { header: 'Data', key: 'data', width: 20 }
            ];

            items.forEach(item => {
                worksheet.addRow({
                    responsavel: item.responsavel,
                    codigo: item.codigo,
                    reagente: item.reagente,
                    lote: item.lote,
                    quantidade: item.quantidade,
                    medida: item.medida,
                    observacao: item.observacao,
                    data: new Date(item.data).toLocaleDateString('pt-BR')
                });
            });

            worksheet.views = [{ state: 'frozen', ySplit: 1 }];

            worksheet.getRow(1).eachCell(cell => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4472C4' }
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;
                row.eachCell(cell => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                });
            });

            worksheet.columns.forEach(column => {
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, cell => {
                    const columnLength = cell.value ? cell.value.toString().length : 10;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
                column.width = maxLength < 15 ? 15 : maxLength + 2;
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=answers.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        next(err);
    }
}