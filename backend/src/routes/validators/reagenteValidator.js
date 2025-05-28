import yup from 'yup';

export default yup
    .object()
    .shape({
        codigo: yup
            .string()
            .required('Código é obrigatório'),
        reagente: yup
            .string()
            .min(3, 'Nome deve ter no mínimo 3 caracteres')
            .required('Nome é obrigatório'),
        quantidade: yup
            .number()
            .typeError('Quantidade deve ser um número')
            .positive('Quantidade deve ser maior que 0')
            .required('Quantidade é obrigatória'),
        unidadeMedida: yup
            .string()
            .required('Unidade de medida é obrigatória'),
        situacao: yup
            .string()
            .oneOf(['RECEBIDO', 'PENDENTE', 'DOACAO'], 'Situação inválida')
            .required('Situação é obrigatória'),
        valorUnitario: yup
            .number()
            .typeError('Valor unitário deve ser um número')
            .positive('Valor unitário deve ser maior que 0')
            .required('Valor unitário é obrigatório'),
        fornecedor: yup
            .string()
            .required('Fornecedor é obrigatório'),
        limiteMin: yup
            .number()
            .typeError('Limite mínimo deve ser um número')
            .positive('Limite mínimo deve ser maior que 0')
            .required('Limite mínimo é obrigatório'),
        limiteMax: yup
            .number()
            .typeError('Limite máximo deve ser um número')
            .positive('Limite máximo deve ser maior que 0')
            .required('Limite máximo é obrigatório'),
    });