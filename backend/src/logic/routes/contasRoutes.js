const express = require('express');
const router = express.Router();
const contasController = require('../controllers/contasController');
const AuthMiddleware = require('../middlewares/authMiddleware');

router.use(AuthMiddleware.authenticateToken);

// GET /api/contas - Listar contas
router.get('/', contasController.listarContas);

// GET /api/contas/:id - Buscar conta por ID
router.get('/:id', contasController.buscarConta);

// POST /api/contas - Criar conta
router.post('/', contasController.criarConta);

// PUT /api/contas/:id - Atualizar conta
router.put('/:id', contasController.atualizarConta);

// DELETE /api/contas/:id - Deletar conta
router.delete('/:id', contasController.deletarConta);

module.exports = router;