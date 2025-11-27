const express = require('express');
const router = express.Router();
const objetivosController = require('../controllers/objetivosController');
const AuthMiddleware = require('../middlewares/authMiddleware');

router.use(AuthMiddleware.authenticateToken);

// GET /api/objetivos - Listar objetivos
router.get('/', objetivosController.listarObjetivos);

// GET /api/objetivos/:id - Buscar objetivo por ID
router.get('/:id', objetivosController.buscarObjetivo);

// POST /api/objetivos - Criar objetivo
router.post('/', objetivosController.criarObjetivo);

// PUT /api/objetivos/:id - Atualizar objetivo
router.put('/:id', objetivosController.atualizarObjetivo);

// POST /api/objetivos/:id/contribuir - Adicionar contribuição
router.post('/:id/contribuir', objetivosController.adicionarContribuicao);

// DELETE /api/objetivos/:id - Deletar objetivo
router.delete('/:id', objetivosController.deletarObjetivo);

module.exports = router;