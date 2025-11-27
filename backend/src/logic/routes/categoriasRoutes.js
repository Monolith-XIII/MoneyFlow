const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');
const AuthMiddleware = require('../middlewares/authMiddleware');

router.use(AuthMiddleware.authenticateToken);

// GET /api/categorias - Listar categorias
router.get('/', categoriasController.listarCategorias);

// GET /api/categorias/:id - Buscar categoria por ID
router.get('/:id', categoriasController.buscarCategoria);

// POST /api/categorias - Criar categoria
router.post('/', categoriasController.criarCategoria);

// PUT /api/categorias/:id - Atualizar categoria
router.put('/:id', categoriasController.atualizarCategoria);

// DELETE /api/categorias/:id - Deletar categoria
router.delete('/:id', categoriasController.deletarCategoria);

module.exports = router;