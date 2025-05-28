import yup from 'yup';

export default yup
    .object()
    .shape({
        nome: yup
            .string()
            .min(3, 'Nome deve ter no mínimo 3 caracteres')
            .required('Nome é obrigatório'),
        senha: yup
            .string()
            .min(6, 'Senha deve ter no mínimo 6 caracteres')
            .required('Senha é obrigatória'),
        login: yup
            .string()
            .required('Login é obrigatório'),
    });
