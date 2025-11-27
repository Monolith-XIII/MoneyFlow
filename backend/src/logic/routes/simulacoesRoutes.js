const express = require('express');
const router = express.Router();
const simulacoesController = require('../controllers/simulacoesController');
const AuthMiddleware = require('../middlewares/authMiddleware');

router.use(AuthMiddleware.authenticateToken);

// GET /api/simulacoes - Listar simulações
router.get('/', simulacoesController.listarSimulacoes);

// GET /api/simulacoes/:id - Buscar simulação por ID
router.get('/:id', simulacoesController.buscarSimulacao);

// POST /api/simulacoes - Criar simulação
router.post('/', simulacoesController.criarSimulacao);

// DELETE /api/simulacoes/:id - Deletar simulação
router.delete('/:id', simulacoesController.deletarSimulacao);

module.exports = router;