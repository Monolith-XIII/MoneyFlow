const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

// Importação da configuração do banco
const MoneyFlowDB = require("./db/config");

// Importação dos models
const createModels = require("./db/models");

// Importação das rotas
const routes = require("./logic/routes");

class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;

    this.initializeMiddlewares();
    this.initializeDatabase();
    this.initializeModels();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeMiddlewares() {
    // Segurança
    this.app.use(helmet());

    // CORS
    this.app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3010",
        credentials: true,
      })
    );

    // Logs
    if (process.env.NODE_ENV === "development") {
      this.app.use(morgan("dev"));
    }

    // Body parser
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));

    // Servir arquivos estáticos
    this.app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  }

  initializeDatabase() {
    // Já está configurado através do db/config/index.js
    console.log("📊 Banco de dados inicializado");
  }

  initializeModels() {
    // Inicializa todos os models com a instância do banco
    this.models = createModels(MoneyFlowDB);
    console.log("🗂️ Models inicializados");
  }

  initializeRoutes() {
    // Rotas da API
    this.app.use("/api", routes);

    // Health check
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      });
    });

    // Rota padrão
    this.app.get("/", (req, res) => {
      res.json({
        message: "Money Flow API",
        version: "1.0.0",
        documentation: "/api/docs",
      });
    });
  }

  initializeErrorHandling() {
    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        error: "Rota não encontrada",
        path: req.originalUrl,
      });
    });

    // Error handler global
    this.app.use((error, req, res, next) => {
      console.error("Erro não tratado:", error);

      res.status(error.status || 500).json({
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Erro interno do servidor",
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      });
    });
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`🚀 Servidor rodando na porta ${this.port}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${this.port}/health`);
    });

    return this.server;
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log("🛑 Servidor parado");
    }
  }
}

module.exports = App;
