import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "1.0.0",
    title: "Controle de Estoque - Logbook",
    description: "Documentação da API do controle de estoque - Logbook",
  },
  servers: [
    {
      url: "http://localhost:3000/"
    }
  ],
  components: {
    schemas: {
      InternalServerError: {
        code: "",
        message: "",
      },
      reagente: {
        codigo: "123",
        reagente: "abc",
        quantidade: 0,
        dataRecebido: "00/00/0000",
        unidadeMedida: "KG",
        situacao: "RECEBIDO" || "PENDENTE" || "DOACAO",
        valorUnitario: 0,
        valorTotal: 0,
        fornecedor: "ABC",
        lote: "ABC123",
        validade: "00/00/0000",
        localizacao: "A1",
        armario: "B2",
        prateleira: "C3",
        solicitante: "ABC",
        limiteMin: 0,
        limiteMax: 0,
      },
      answer: {
        responsavel: "Abc",
        codigo: "123",
        reagente: "ABC",
        quantidade: 0,
        medida: "KG",
        observacao: "Utilizado",
      },
      userAdm: {
        nome: "Abc",
        login: "abc",
        email: "abc@abc",
        senha: "abc123",
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer"
      }
    }
  },
};

const outputFile = "./config/swagger.json";
const endpointsFiles = ["./routes.js"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc)
  .then(async () => {
    await import("./server.js");
  });
