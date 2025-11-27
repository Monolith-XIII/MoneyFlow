// CORREÇÃO: Nome do arquivo estava migrationOptmizer.js (com 'm' faltando)
const MoneyFlowDB = require('../config');

class MigrationOptimizer {
    async createIndexes() {
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_transacoes_usuario_data ON transacoes(usuario_id, data_transacao)',
            'CREATE INDEX IF NOT EXISTS idx_transacoes_categoria ON transacoes(categoria_id)',
            'CREATE INDEX IF NOT EXISTS idx_transacoes_conta ON transacoes(conta_id)',
            'CREATE INDEX IF NOT EXISTS idx_categorias_usuario ON categorias(usuario_id)',
            'CREATE INDEX IF NOT EXISTS idx_contas_usuario ON contas(usuario_id)',
            'CREATE INDEX IF NOT EXISTS idx_orcamentos_usuario_mes ON orcamentos(usuario_id, mes_ano)'
        ];

        console.log(' Criando índices de performance... ');

        for (const indexSql of indexes) {
            await new Promise((resolve, reject) => {
                MoneyFlowDB.run(indexSql, (err) => {
                    if (err) {
                        console.error(` Erro criando índice: ${indexSql} `, err.message);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }

        console.log(' Índices de performance criados/verificados. ');
    }
}

module.exports = MigrationOptimizer;