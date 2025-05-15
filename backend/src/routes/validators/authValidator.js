import yup from "yup";

export default yup
  .object()
  .shape({
    login: yup
      .string()
      .required("Login é obrigatório"),
    senha: yup
      .string()
      .required("Senha é obrigatória"),
  });