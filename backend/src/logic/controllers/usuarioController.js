const bcrypt = require('bcryptjs');
const MoneyFlowDB = require('../../db/config');

class UsuarioController {
  
  // Buscar perfil do usuário
  async buscarPerfil(req, res) {
    try {
      const { usuario_id } = req.user;

      const usuario = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          'SELECT id, nome, email, data_criacao, ultimo_acesso FROM usuarios WHERE id = ?',
          [usuario_id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(usuario);

    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  }

  // Atualizar perfil
  async atualizarPerfil(req, res) {
    try {
      const { usuario_id } = req.user;
      const { nome, email } = req.body;

      if (!nome || !email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios' });
      }

      // Verificar se email já existe em outro usuário
      const emailExistente = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          'SELECT id FROM usuarios WHERE email = ? AND id != ?',
          [email, usuario_id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (emailExistente) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
          [nome, email, usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({ message: 'Perfil atualizado com sucesso' });

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  }

  // Alterar senha
  async alterarSenha(req, res) {
    try {
      const { usuario_id } = req.user;
      const { senha_atual, nova_senha } = req.body;

      if (!senha_atual || !nova_senha) {
        return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
      }

      if (nova_senha.length < 6) {
        return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
      }

      // Buscar usuário com senha
      const usuario = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          'SELECT senha_hash FROM usuarios WHERE id = ?',
          [usuario_id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Verificar senha atual
      const senhaValida = await bcrypt.compare(senha_atual, usuario.senha_hash);
      
      if (!senhaValida) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }

      // Hash da nova senha
      const saltRounds = 12;
      const novaSenhaHash = await bcrypt.hash(nova_senha, saltRounds);

      // Atualizar senha
      await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          'UPDATE usuarios SET senha_hash = ? WHERE id = ?',
          [novaSenhaHash, usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      res.json({ message: 'Senha alterada com sucesso' });

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ error: 'Erro ao alterar senha' });
    }
  }

  // Buscar usuários (para colaboração)
  async buscarUsuarios(req, res) {
    try {
      const { usuario_id } = req.user;
      const { nome } = req.query;

      if (!nome) {
        return res.status(400).json({ error: 'Parâmetro "nome" é obrigatório' });
      }

      const usuarios = await new Promise((resolve, reject) => {
        MoneyFlowDB.all(
          'SELECT id, nome, email FROM usuarios WHERE nome LIKE ? AND id != ? AND ativo = 1 LIMIT 10',
          [`%${nome}%`, usuario_id],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      res.json(usuarios);

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  }

  // Desativar conta
  async desativarConta(req, res) {
    try {
      const { usuario_id } = req.user;
      const { confirmacao } = req.body;

      if (confirmacao !== 'CONFIRMAR DESATIVAÇÃO') {
        return res.status(400).json({ 
          error: 'É necessário confirmar a desativação digitando: CONFIRMAR DESATIVAÇÃO' 
        });
      }

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          'UPDATE usuarios SET ativo = 0 WHERE id = ?',
          [usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({ message: 'Conta desativada com sucesso' });

    } catch (error) {
      console.error('Erro ao desativar conta:', error);
      res.status(500).json({ error: 'Erro ao desativar conta' });
    }
  }
}

module.exports = new UsuarioController();