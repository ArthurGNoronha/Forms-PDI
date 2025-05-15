import yup from 'yup';

export default yup
    .object()
    .shape({
        responsavel: yup
            .string()
            .required('Nome do responsável é obrigatório'),
        codigo: yup
            .string()
            .required('Código é obrigatório'),
        reagente: yup
            .string()
            .required('Reagente é obrigatório'),
        quantidade: yup
            .number()
            .typeError('Quantidade deve ser um número')
            .positive('Quantidade deve ser maior que zero')
            .required('Quantidade é obrigatória'),
        medida: yup
            .string()
            .required('Medida é obrigatória'),
    });