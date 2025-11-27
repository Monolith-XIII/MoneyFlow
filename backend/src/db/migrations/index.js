// AQUI SERÁ O PONTO DE ENTRADA ÚNICO PARA TODO O SISTEMA DE MIGRAÇÕES
// Importamos todas as classes dos módulos configurados de forma organizada e modular
const Migration = require('./migration');
const MigrationRunner = require('./migrationRunner');
const MigrationOptimizer = require('./migrationOptimizer');
const MigrationVerifier = require('./migrationVerifier');
const MigrationExecutor = require('./migrationExecutor');

// Fluxo de execução automática dos módulos, chamamos e usamos o MigrationExecutor para seguir a ordem desejada do processo de Migração, todas as configurações estão definidas interamente, apenas faremos um log de erros e console.logs de verificação sobre sucesso ou não da execução.
async function main() {
    try {
        const executor = new MigrationExecutor();
        await executor.executeFullMigration();
        console.log(' Banco totalmente configurado e otimizado! ');
        process.exit(0); // Código 0 = sucesso
    } catch (error) {
        console.error(' Falha no processo de migration: ', error.message);
        process.exit(1); // Código 1 = erro
    }
}

// Função anônima para verificador de execução direta, só executa o fluxo automaticamente se chamado via: node migrations/index.js ou chamado explicitamente via linha de comando, importante para evitar migrações acidentais em casos deste arquivo ser importado como um módulo.
if (require.main === module) {
    main();
}

// Lista de exportações organizadas, dessa maneita se permite usar exatamente o que precisa em cada contexto, Migration para ver as definições das tabelas, MigrationRunner para executar os comandos SQL, MigrationOptimizer para criar os índices, MigrationVerifier para verificar a integridade das tabelas criadas durante a migração, MigrationExecutor para usar os módulos em ordem. Todo esse fluxo está definido no alias runMigrations para execução mais simplificada.
module.exports = {
    Migration,
    MigrationRunner,
    MigrationOptimizer,
    MigrationVerifier,
    MigrationExecutor,
    runMigrations: main
};