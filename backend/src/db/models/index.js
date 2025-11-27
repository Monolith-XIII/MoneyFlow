// INDEX PRINCIPAL DOS MODELS - Exportação única de todos os models
// Por que existe: Centralizar imports e facilitar manutenção
// Fornece acesso organizado a todos os models da aplicação
const BaseModel = require('./baseModel');

// Factory function para inicializar todos os models com a instância do banco
// Por que factory: Permite inicialização lazy e injecção de dependência
const createModels = (db) => ({
  // Model base para extensão (não deve ser usado diretamente)
  BaseModel,
  
  // Entities específicas - instanciadas com a conexão do banco
  Usuario: require('./entities/Usuario')(db),
  Categoria: require('./entities/Categoria')(db),
  Transacao: require('./entities/Transacao')(db),
  Conta: require('./entities/Conta')(db),
  Objetivo: require('./entities/Objetivo')(db),
  Orcamento: require('./entities/Orcamento')(db),
  ObjetivoCompartilhado: require('./entities/ObjetivoCompartilhado')(db),
  ConviteColaboracao: require('./entities/ConviteColaboracao')(db),
  Simulacao: require('./entities/Simulacao')(db)
});

module.exports = createModels;