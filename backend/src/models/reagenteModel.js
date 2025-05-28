import mongoose from 'mongoose';

const reagenteSchema = new mongoose.Schema({
    codigo: {
        type: String,
        required: true,
        unique: true,
    },
    reagente: {
        type: String,
        required: true,
    },
    quantidade: {
        type: Number,
        required: true,
    },
    unidadeMedida: {
        type: String,
        required: true,
    },
    dataRecebido: {
        type: Date,
        default: Date.now,
        required: false,
    },
    situacao: {
        type: String,
        enum: ['RECEBIDO', 'PENDENTE', 'DOACAO'],
        default: 'RECEBIDO',
        required: true,
    },
    valorUnitario: {
        type: Number,
        required: true,
    },
    valorTotal: {
        type: Number,
        required: true,
    },
    fornecedor: {
        type: String,
        required: true,
    },
    lote: {
        type: String,
        required: false,
    },
    validade: {
        type: Date,
        required: false,
    },
    localizacao: {
        type: String,
        required: true,
    },
    limiteMin: {
        type: Number,
        required: true,
    },
    limiteMax: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
        required: true,
    },
}, {
    versionKey: false,
    timestamps: true,
});

const Reagente = mongoose.models.Reagente || mongoose.model('Reagente', reagenteSchema);

export default Reagente;