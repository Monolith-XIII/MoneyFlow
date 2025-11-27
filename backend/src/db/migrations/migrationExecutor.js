// AQUI SERÁ DEFINIDO O EXECUTOR AUTOMÁTICO DAS MIGRATIONS
// Orquestra todo o fluxo: Run → Optimize → Verify

// Importamos classes dos módulos configurados de forma organizada e modular
const MigrationRunner = require('./migrationRunner');
const MigrationOptimizer = require('./migrationOptimizer');
const MigrationVerifier = require('./migrationVerifier');

/**
 * CLASSE EXECUTOR - ORQUESTRADOR COMPLETO DO PROCESSO DE MIGRATION
 * Coordena a execução em sequência: criar tabelas → otimizar → verificar
 */
class MigrationExecutor {
    
    /**
     * MÉTODO PRINCIPAL - EXECUTA TODO O FLUXO DE MIGRATION
     * Sequência garantida: Tables → Indexes → Verification
     */
    async executeFullMigration() {
        try {
            console.log('🚀 Iniciando processo completo de migration...');
            
            // 1. 🏗️ EXECUTA MIGRATIONS (cria tabelas)
            const runner = new MigrationRunner();
            await runner.run();
            
            // 2. 📈 OTIMIZA PERFORMANCE (cria índices)
            const optimizer = new MigrationOptimizer();
            await optimizer.createIndexes();
            
            // 3. 🔍 VERIFICA INTEGRIDADE (confirma criação)
            const verifier = new MigrationVerifier();
            await verifier.verify();
            
            console.log(' Processo de migration concluído com sucesso! ');
            return true;
            
        } catch (error) {
            console.error(' Erro no processo de migration: ', error.message);
            throw error;
        }
    }
}

// Exporta o Executor para uso direto ou via linha de comando
module.exports = MigrationExecutor;