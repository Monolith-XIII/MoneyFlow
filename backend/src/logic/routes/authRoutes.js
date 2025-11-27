const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const MoneyFlowDB = require('../../db/config'); // ADICIONAR ESTA LINHA

// POST /api/auth/registrar
router.post('/registrar', authController.registrar);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/verificar (rota protegida)
router.get('/verificar', AuthMiddleware.authenticateToken, authController.verificar);

// Rota de teste do banco (temporária)
router.get('/test-db', async (req, res) => {
  try {
    console.log('🧪 Testando conexão com banco...');
    
    // Testar se a tabela existe
    const tables = await new Promise((resolve, reject) => {
      MoneyFlowDB.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('📊 Tabelas encontradas:', tables);
    
    // Testar se tem usuários
    const usuarios = await new Promise((resolve, reject) => {
      MoneyFlowDB.all("SELECT id, nome, email FROM usuarios", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('👥 Usuários no banco:', usuarios);
    
    res.json({
      tables: tables.map(t => t.name),
      usuarios: usuarios,
      status: 'OK'
    });
    
  } catch (error) {
    console.error('❌ Erro no teste do banco:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;