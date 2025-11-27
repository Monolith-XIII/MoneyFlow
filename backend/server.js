const App = require("./src/app");

// Inicialização do servidor
const server = new App();

// Iniciar servidor
server.start();

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Recebido SIGINT. Encerrando servidor...");
  server.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("🛑 Recebido SIGTERM. Encerrando servidor...");
  server.stop();
  process.exit(0);
});

module.exports = server.app;
