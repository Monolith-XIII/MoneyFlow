const BaseModel = require('../baseModel');

// MODEL USUARIO - Gerencia operações da tabela de usuários
// Por que existe: Centralizar todas as operações específicas de usuários
// Herda CRUD básico do BaseModel e adiciona métodos específicos
class Usuario extends BaseModel {
  constructor(db) {
    // Inicializa com nome da tabela e instância do banco
    super('usuarios', db);
  }

  // BUSCAR POR EMAIL - Encontra usuário pelo email (campo único)
  // Por que existe: Email é campo de login, precisa de busca específica
  // Exemplo de uso: await usuarioModel.findByEmail('joao@email.com')
  findByEmail(email) {
    return new Promise((resolve, reject) => {
      if (!email) {
        reject(new Error('Email é obrigatório'));
        return;
      }

      this.db.get(
        'SELECT * FROM usuarios WHERE email = ?',
        [email],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  // BUSCAR POR NOME - Encontra usuários por nome (busca parcial)
  // Por que existe: Permite buscar usuários por similaridade de nome
  // Exemplo de uso: await usuarioModel.findByName('João')
  findByName(nome) {
    return new Promise((resolve, reject) => {
      if (!nome) {
        reject(new Error('Nome é obrigatório'));
        return;
      }

      this.db.all(
        'SELECT * FROM usuarios WHERE nome LIKE ?',
        [`%${nome}%`],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  // ATUALIZAR ÚLTIMO LOGIN - Atualiza timestamp do último acesso
  // Por que existe: Rastrear atividade do usuário para analytics
  // Exemplo de uso: await usuarioModel.updateLastLogin(1)
  updateLastLogin(usuarioId) {
    return new Promise((resolve, reject) => {
      if (!usuarioId) {
        reject(new Error('ID do usuário é obrigatório'));
        return;
      }

      this.db.run(
        'UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?',
        [usuarioId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ updatedId: usuarioId, changes: this.changes });
          }
        }
      );
    });
  }
}

// Exporta instância única (Singleton) para reutilização em toda aplicação
// Por que singleton: Evitar múltiplas instâncias conectando ao mesmo banco
module.exports = (db) => new Usuario(db);