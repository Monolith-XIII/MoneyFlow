// NESTE ARQUIVO IREMOS DEFINIR ALGUMAS CONFIGURAÇÕES DE PERFORMANCE PARA O BANCO DE DADOS
// Importando nosso banco de dados já conectado
const MoneyFlowDB = require('./database');

// Função que iremos chamar posteriormente no index.js, por razões de modularidade e manutenções, decidimos separar um único código com configurações, debugs e integridade na interrupção do servidor!
function configureDatabase() {
    // Aqui jaz uma definição de quanto tempo o banco deve esperar enquanto uma requisção der erro, que no nosso caso colocamos por 3 segundos, ou seja, caso alguma requisição der erro, ao invés de apenas fecharmos a aplicação, iremos tentar novamente durante 3 segundos, apenas para verificações se não houve algum entupimento ou requisições múltiplas.
    MoneyFlowDB.configure('busyTimeout', 3000);
    
    // Diretivas importadas da biblioteca sqlite3, PRAGMA é um comando de configuração, já o que está sendo aplicado é, para o foreign_keys, quando ativo, faz uma verificação se o que for deletado, não tem um relacionamento com outra parte do banco, ou seja, verificação de chaves estrangeiras, caso tenha, o próprio SQLite irá bloquear a requisição desse delete. Já o journal_mode no modo WAL, acontece o seguinte, em aplicações que há muitas escritas, normalmente seria escrito dados no próprio banco, o que é lento, todavia, essa configuração escreve em um arquivo temporário, que torna o processo mais rápido, além de perimitir leituras e escritas simultâneas.
    MoneyFlowDB.run('PRAGMA foreign_keys = ON');
    MoneyFlowDB.run('PRAGMA journal_mode = WAL');
    
    // Apenas um console.log para verificação caso as configurações tenham sidas aplicadas corretamente no index.js.
    console.log('⚙️ Configurações aplicadas');
}

// Exportando a função configureDatabase para uso no index.js.
module.exports = { configureDatabase };