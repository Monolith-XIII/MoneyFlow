// DEFINIREMOS AQUI UM SISTEMA DE DESLIGAMENTO DA APLICAÇÃO PARA GARANTIR A INTEGRIDADE DO SERVIDOR
// Importando nosso banco de dados já conectado 
const MoneyFlowDB = require('./database');

// Função que iremos chamar posteriormente no index.js, por razões de modularidade e manutenções, decidimos separar um único código pelos módulos de configurações, debugs e integridade na interrupção do servidor!
function setupGracefulShutdown() {
    // Uso do event listener process.on, que tem como fonte o Node.js, ele vai escutar eventos do próprio sistema operacional, o parâmetro que iremos dar a ele é justamente o SIGINT, que é um sinal de interrupção, ou seja, quando a aplicação parar (como apertando ctrl + c no terminal), a arrow function que aqui definimos será chamada. 
    process.on('SIGINT', () => {
        // Chamamos o metódo MoneyFlowDB.close e o damos um parâmetro de erro.
        MoneyFlowDB.close((err) => {
            // Caso der erro, iremos exibi-lo com um console.log, caso contrário, o banco fechou corretamente, que tambéms exibimos com um console.log.
            if (err) {
                console.error('Erro ao fechar banco:', err.message);
            } else {
                console.log('🔒 Conexão fechada.');
            }
            // Tão logo, finalizamos a aplicação com process.exit. É apenas uma maneira íntegra de finalizarmos a aplicação!
            process.exit(0);
        });
    });
    
    // Apenas um console.log para verificação caso o desligamento íntegro tenha sidas aplicado corretamente no index.js.
    console.log('🛡️ Shutdown configurado');
}

// Exportando a função setupGracefulShutdown para uso no index.js.
module.exports = { setupGracefulShutdown };