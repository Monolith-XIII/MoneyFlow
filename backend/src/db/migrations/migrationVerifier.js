// AQUI SERÁ DEFINIDA A VERIFICAÇÃO DE INTEGRIDADE DO BANCO
// Responsável por confirmar se todas as tabelas foram criadas corretamente

const MoneyFlowDB = require('../config');
const Migration = require('./migration');

/**
 * CLASSE VERIFIER - VERIFICADOR DE INTEGRIDADE DO BANCO
 * Confirma se toda a estrutura esperada está presente no banco
 * Essencial para validar deployments e scripts de CI/CD
 */
class MigrationVerifier {
    constructor() {
        this.migration = new Migration();
    }

    /**
     * MÉTODO PRINCIPAL - VERIFICA SE TODAS AS TABELAS EXISTEM
     * Consulta a tabela interna sqlite_master para confirmar existência
     */
    async verify() {
        return new Promise((resolve, reject) => {
            console.log(' Verificando integridade do banco... ');
            
            // CORREÇÃO: getTableNames() no plural
            const expectedTables = this.migration.getTableNames();
            const missingTables = [];
            let checked = 0;

            // Para cada tabela esperada, verifica se existe no sqlite_master
            expectedTables.forEach(tableName => {
                MoneyFlowDB.get(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
                    [tableName],
                    (err, row) => {
                        checked++;
                        
                        if (err) {
                            reject(err);
                            return;
                        }

                        // Se não encontrou a tabela, adiciona à lista de faltantes
                        if (!row) {
                            missingTables.push(tableName);
                        }

                        // Quando todas as verificações terminam, retorna resultado
                        if (checked === expectedTables.length) {
                            if (missingTables.length > 0) {
                                reject(new Error(`Tabelas faltando: ${missingTables.join(', ')}`));
                            } else {
                                console.log(' Todas as tabelas verificadas com sucesso! ');
                                resolve(true);
                            }
                        }
                    }
                );
            });
        });
    }
}

// Exporta o Verifier para validações pós-migration
module.exports = MigrationVerifier;