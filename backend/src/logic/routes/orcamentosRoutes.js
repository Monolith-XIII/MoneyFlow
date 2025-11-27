const express = require('express');
const router = express.Router();
const orcamentosController = require('../controllers/orcamentosController');
const AuthMiddleware = require('../middlewares/authMiddleware');

router.use(AuthMiddleware.authenticateToken);

// GET /api/orcamentos - Listar orçamentos
router.get('/', orcamentosController.listarOrcamentos);

// GET /api/orcamentos/:id - Buscar orçamento por ID
router.get('/:id', orcamentosController.buscarOrcamento);

// POST /api/orcamentos - Criar orçamento
router.post('/', orcamentosController.criarOrcamento);

// PUT /api/orcamentos/:id - Atualizar orçamento
router.put('/:id', orcamentosController.atualizarOrcamento);

// DELETE /api/orcamentos/:id - Deletar orçamento
router.delete('/:id', orcamentosController.deletarOrcamento);

module.exports = router;