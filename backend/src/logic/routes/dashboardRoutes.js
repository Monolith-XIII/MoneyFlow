const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const AuthMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas exigem autenticação
router.use(AuthMiddleware.authenticateToken);

// GET /api/dashboard/consolidado?mes=11&ano=2024
router.get('/consolidado', dashboardController.getDadosConsolidados);

// GET /api/dashboard/contas-pagar?mes=11&ano=2024
router.get('/contas-pagar', dashboardController.getStatusContasPagar);

// GET /api/dashboard/grafico-categorias?mes=11&ano=2024&tipo=despesa
router.get('/grafico-categorias', dashboardController.getDadosGraficoCategorias);

// GET /api/dashboard/evolucao-mensal
router.get('/evolucao-mensal', dashboardController.getEvolucaoMensal);

module.exports = router;