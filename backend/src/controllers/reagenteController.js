import Reagente from '../models/reagenteModel.js';
import exceljs from 'exceljs';

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

export const createExcel = async (req, res, next) => {
    /*
    #swagger.ignore = true
    */
    try {
        const reagentes = await Reagente.find().sort({ reagente: 1 });

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Reagentes');

        worksheet.columns = [
            { header: 'Código', key: 'codigo', width: 15 },
            { header: 'Reagente', key: 'reagente', width: 25 },
            { header: 'Quantidade', key: 'quantidade', width: 15 },
            { header: 'Unidade', key: 'unidadeMedida', width: 10 },
            { header: 'Valor Unitário', key: 'valorUnitario', width: 15 },
            { header: 'Valor Total', key: 'valorTotal', width: 15 },
            { header: 'Fornecedor', key: 'fornecedor', width: 20 },
            { header: 'Lote', key: 'lote', width: 15 },
            { header: 'Validade', key: 'validade', width: 15 },
            { header: 'Data Recebido', key: 'dataRecebido', width: 15 },
            { header: 'Situação', key: 'situacao', width: 15 },
            { header: 'Localização', key: 'localizacao', width: 20 },
            { header: 'Limite Mínimo', key: 'limiteMin', width: 15 },
            { header: 'Limite Máximo', key: 'limiteMax', width: 15 }
        ];

        reagentes.forEach(item => {
            worksheet.addRow({
                codigo: item.codigo,
                reagente: item.reagente,
                quantidade: item.quantidade,
                unidadeMedida: item.unidadeMedida,
                valorUnitario: item.valorUnitario,
                valorTotal: item.valorTotal,
                fornecedor: item.fornecedor,
                lote: item.lote,
                validade: item.validade ? new Date(item.validade).toLocaleDateString('pt-BR') : '',
                dataRecebido: item.dataRecebido ? new Date(item.dataRecebido).toLocaleDateString('pt-BR') : '',
                situacao: item.situacao,
                localizacao: item.localizacao,
                limiteMin: item.limiteMin,
                limiteMax: item.limiteMax
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

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reagentes.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        next(err);
    }
}