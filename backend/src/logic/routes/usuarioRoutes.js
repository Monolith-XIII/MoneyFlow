const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const AuthMiddleware = require('../middlewares/authMiddleware');

router.use(AuthMiddleware.authenticateToken);

// GET /api/usuario/perfil - Buscar perfil
router.get('/perfil', usuarioController.buscarPerfil);

// PUT /api/usuario/perfil - Atualizar perfil
router.put('/perfil', usuarioController.atualizarPerfil);

// PUT /api/usuario/alterar-senha - Alterar senha
router.put('/alterar-senha', usuarioController.alterarSenha);

// GET /api/usuario/buscar - Buscar usuários (para colaboração)
router.get('/buscar', usuarioController.buscarUsuarios);

// POST /api/usuario/desativar-conta - Desativar conta
router.post('/desativar-conta', usuarioController.desativarConta);

module.exports = router;