import yup from 'yup';

export default yup
    .object()
    .shape({
        codigo: yup
            .string(),
        reagente: yup
            .string()
            .min(3, 'Nome deve ter no mínimo 3 caracteres'),
        quantidade: yup
            .number()
            .typeError('Quantidade deve ser um número')
            .positive('Quantidade deve ser maior que 0'),
        unidadeMedida: yup
            .string(),
        situacao: yup
            .string()
            .oneOf(['RECEBIDO', 'PENDENTE', 'DOACAO'], 'Situação inválida'),
        valorUnitario: yup
            .number()
            .typeError('Valor unitário deve ser um número')
            .positive('Valor unitário deve ser maior que 0'),
        fornecedor: yup
            .string(),
        solicitante: yup
            .string(),
        limiteMin: yup
            .number()
            .typeError('Limite mínimo deve ser um número')
            .positive('Limite mínimo deve ser maior que 0'),
        limiteMax: yup
            .number()
            .typeError('Limite máximo deve ser um número')
            .positive('Limite máximo deve ser maior que 0')
    });