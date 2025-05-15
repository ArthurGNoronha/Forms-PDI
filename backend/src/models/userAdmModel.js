import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userAdmSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    login: {
        type: String,
        required: true,
        unique: true,
    },
    senha: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
        unique: true,
    },
    status: {
        type: Boolean,
        default: true,
        required: true,
    },
}, {
    versionKey: false,
    timestamps: true 
});

userAdmSchema.pre('save', async function(next) {
    if(!this.isModified('senha')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.senha = await bcrypt.hash(this.senha, salt);
        next();
    } catch(err) {
        next(err);
    }
});

userAdmSchema.methods.verifyPass = async function(senha) {
    return await bcrypt.compare(senha, this.senha);
};

const UserAdm = mongoose.model('UserAdm', userAdmSchema);

export default UserAdm;