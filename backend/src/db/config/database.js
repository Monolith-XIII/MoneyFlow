// ESSE É UM ARQUIVO DE CONEXÃO BÁSICA COM O BANCO DE DADOS moneyflow.db
// --- Importações necessárias para a conexão com o banco de dados no modelo SQLite ----
// Importando a biblioteca sqlite3 como uma constante chamada sqlite3, biblioteca tal importanda como constante para facilidade de reuso durante a produção do código!
const sqlite3 = require('sqlite3').verbose();

// Bibliotecas usadas para manipulações de arquivos e caminhos, iremos usar para maior facilidade de verficação e automação de pastas ou arquivos não existentes, ou seja, evitar erros nos mais variados ambientes, principalmente os de produção.
const path = require('path');
const fs = require('fs');

// Definir um caminho absoluto para localizar o banco
const DB_PATH = path.join(__dirname, '..', 'database', 'moneyflow.db');
const DB_DIR = path.dirname(DB_PATH);

// Função anônima extra para garantir que o diretório exista, se o operador booleano ! retornar alguma resposta de verdadeiro ou falso para a pergunta de existir ou não o caminho desejado do banco, ele irá criar todo o caminho necessário, caso falso.
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, {recursive: true});
}

// -- Configuração de conexão com o banco de dados --
// Criamos uma constante chamada MoneyFlowDB que tenta executar uma instanciação da classe sqlite3.Database da biblioteca sqlite3, ou seja, criamos um objeto que representa nossa conexão com o banco de dados, todavia, há uma combinação com o operador "|", chamado de BITWISE OR, diferentemente do operador LOGICAL OR, que faz uma escolha entre Flags (valores usados como parâmetros na situação), o BITWISE OR atribui ambas escolhas como permissão, ou seja, nesse caso, faz sentido o uso já que queremos ambas permissões de READWRITE e CREATE caso o banco não exista, para criar um novo arquivo vazio, mas configurado, caso já exista apenas iremos ler e escrever. Após isso fizemos uma arrow function que chama um callback para logging e debugs, importamos o parâmetro err para sabermos qual foi o erro e fazemos um if else, caso ocorra algum erro, iremos chamar a messagem do erro e dizer ao console que houve um erro, tão logo também fechamos a aplicação, todavia, caso dê tudo certo, o banco está rodando corretamente, então damos ao console uma mensagem de banco conectado e o seu caminho feito.
const MoneyFlowDB = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(' HOUVE UM ERRO CRÍTICO - Falha na tentativa de conexão com o banco de dados! Erro: ', err.message);
        process.exit(1);
    } else {
        console.log(` Banco de dados conectado ao SQLite: ${DB_PATH} `);
    }
})

// Exportando a contante MoneyFlowDB para uso em outros arquivos.
module.exports = MoneyFlowDB;