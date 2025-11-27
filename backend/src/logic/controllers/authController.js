const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const MoneyFlowDB = require('../../db/config');

class AuthController {
  
  // Registrar novo usuário
  async registrar(req, res) {
    try {
      const { nome, email, senha } = req.body;

      // Validações básicas
      if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      }

      if (senha.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
      }

      // Verificar se email já existe
      const usuarioExistente = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          'SELECT id FROM usuarios WHERE email = ?',
          [email],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (usuarioExistente) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Hash da senha
      const saltRounds = 12;
      const senhaHash = await bcrypt.hash(senha, saltRounds);

      // Inserir usuário
      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
          [nome, email, senhaHash],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      // Gerar token JWT
      const token = jwt.sign(
        { usuario_id: result.id, email },
        process.env.JWT_SECRET || 'moneyflow-secret',
        { expiresIn: '30d' }
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        token,
        usuario: {
          id: result.id,
          nome,
          email
        }
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      // Buscar usuário
      const usuario = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          'SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ? AND ativo = 1',
          [email],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!usuario) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
      
      if (!senhaValida) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { usuario_id: usuario.id, email: usuario.email },
        process.env.JWT_SECRET || 'moneyflow-secret',
        { expiresIn: '30d' }
      );

      // Atualizar último acesso
      await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          'UPDATE usuarios SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id = ?',
          [usuario.id],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      res.json({
        message: 'Login realizado com sucesso',
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        }
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  // Verificar token
  async verificar(req, res) {
    try {
      // Se chegou aqui, o middleware já validou o token
      const usuario = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          'SELECT id, nome, email FROM usuarios WHERE id = ? AND ativo = 1',
          [req.user.usuario_id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({ usuario });

    } catch (error) {
      console.error('Erro ao verificar token:', error);
      res.status(500).json({ error: 'Erro ao verificar autenticação' });
    }
  }
}

module.exports = new AuthController();