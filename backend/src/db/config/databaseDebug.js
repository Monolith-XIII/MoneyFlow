// AQUI SERÁ DEFINIDO OS PROCESSOS DE IDENTIFICAÇÃO E ISOLAMENTO DE ERROS (BUGS)
// Importando nosso banco de dados já conectado 
const MoneyFlowDB = require('./database');

// Função que iremos chamar posteriormente no index.js, por razões de modularidade e manutenções, decidimos separar um único código pelos módulos de configurações, debugs e integridade na interrupção do servidor!
function enableDebug() {
    // Verificação da variável no arquivo .env de caso estar definido em desenvolvimento ou em produção, caso em desenvolvimento, todas as funções definidas de debug serão ativas, em produção, nada é mostrado ao cliente final.
    if (process.env.NODE_ENV === 'development') {
        // Uma escuta do evento emittido que é específico da biblioteca sqlite3, 'trace', o que seria o trace? É uma auditoria nativa de todos os comandos SQL feitos, o que estamos fazendo aqui é usar o db.on, que é um metódo que registra um "ouvinte" para eventos internos do SQLite, ou seja, definimos o evento trace para ser ouvido pelo metódo db.on, tao logo, ao evento ser escutado, uma arrow function será ativada, que vai nos dar um console.log do que foi registrado!
        MoneyFlowDB.on('trace', (sql) => {
            console.log('📝 SQL:', sql);
        });

        // Também usando o metódo MoneyFlowDB.on, profile é um event listener que irá cronometrar todos os comandos SQLs realizados, tão logo usamos uma arrow function que captura o que for registrado e exibe em um temporizador milissegundométrico em um console.log, junto do comando captado.
        MoneyFlowDB.on('profile', (sql, time) => {
            console.log(`⏱️ [${time}ms]`, sql);
            // Exemplo: ⏱️ [2.45ms] SELECT * FROM transacoes
        });
        
        // Usando tabmém o método MoneyFlowDB.on, error é outro event listener, nele vamos captar quaisquer erro que acontecer no banco e os exibir em uma mensagem de erro de um console.log
        MoneyFlowDB.on('error', (err) => {
            console.error('💥 ERRO NO BANCO:', err.message);
        });
        
        // Apenas um console.log para verificação caso os debugs tenham sidas aplicadas corretamente no index.js.
        console.log(' Debug ativado ');
    }
}

// Exportando a função enableDebug para uso no index.js.
module.exports = { enableDebug };