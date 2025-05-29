import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    responsavel: {
        type: String,
        required: true,
    },
    codigo: {
        type: String,
        required: true,
    },
    reagente: {
        type: String,
        required: true,
    },
    quantidade: {
        type: Number,
        required: true,
    },
    medida: {
        type: String,
        required: true,
    },
    lote: {
        type: String,
        required: true,
    },
    observacao: {
        type: String,
        required: false,
    },
    data: {
        type: Date,
        default: Date.now,
        required: true,
    },
}, {
    versionKey: false,
    timestamps: true,
});

const Answer = mongoose.model("Answer", answerSchema);

export default Answer;