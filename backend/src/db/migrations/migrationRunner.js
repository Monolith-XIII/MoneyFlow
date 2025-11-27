// AQUI IRÁ SER DEFINIDO A LÓGICA DE EXECUÇÃO DAS MIGRAÇÕES, SENDO RESPONSÁVEL POR EXECUTAR OS COMANDOS SQL DE MANEIRA SEGURA E TRANSACIONAL

const MoneyFlowDB = require('../config');
const Migration = require('./migration');

class MigrationRunner {
    constructor() {
        this.migration = new Migration();
    }

    async run() {
        return new Promise((resolve, reject) => {
            console.log(' Iniciando execução das migrações... ');

            MoneyFlowDB.serialize(() =>{
                MoneyFlowDB.run('BEGIN TRANSACTION');

                // CORREÇÃO: getTablesSQLs() no plural
                const tableSQLs = this.migration.getTablesSQLs();
                let completed = 0;
                const total = tableSQLs.length;

                tableSQLs.forEach(table => {
                    MoneyFlowDB.run(table.sql, (err) =>{
                        if (err) {
                            console.error(` Erro criando tabela ${table.name}: `, err.message);

                            MoneyFlowDB.run('ROLLBACK');
                            reject(err);
                            return;
                        }

                        completed++
                        console.log(` Tabela ${table.name} criada/verificada `);

                        if (completed === total) {
                            MoneyFlowDB.run('COMMIT', (err) => {
                                if (err) {
                                    console.error(' Erro no commit: ', err.message);
                                    reject(err);
                                } else {
                                    console.log(' Todas as migrações executadas com sucesso! ');
                                    resolve();
                                }
                            });
                        }
                    });
                });
            });
        });
    }
}

module.exports = MigrationRunner;