// Esse é nosso arquivo orquestrador principal do banco de dados, ele será o ponto de entrada para toda a configuração modularizada do banco, onde aqui iremos as importar. Tanto quanto após as configurações aplicadas, exportamos novamente o banco de dados para uso fora das configurações do mesmo.
// Importações dos módulos especializados.
const MoneyFlowDB = require('./database'); // Conexão com o banco de dados
const { configureDatabase } = require('./databaseConfig'); // Função de configurações para performance
const { enableDebug } = require('./databaseDebug'); // Função de exibição de logs SQL em modo de desenvolvimento
const { setupGracefulShutdown } = require('./databaseLifecycle'); // Função de desligamento íntegro da aplicação

// -- Parte de orquestração e ordem de inicialização dos módulos --
// Configurações de performance, aplicando as otimizações de busyTimeout, foreign_keys e jorunal_mode. Deve ser a primeira função a ser executada para garantir um banco otimizado.
configureDatabase();

// Ativação das logs de SQL, tempo de execução e captura de erros dos mesmos. Definido internamente para apenas rodar em desenvolvimento para não impactar aplicação em produção.
enableDebug();

// Configuração do shutdown íntegro para garantir que o banco feche corretamente antes da aplicação.
setupGracefulShutdown();

// Re-exportando o banco de dados para usos fora das configurações.
module.exports = MoneyFlowDB;