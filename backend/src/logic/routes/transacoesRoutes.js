const express = require('express');
const router = express.Router();
const transacoesController = require('../controllers/transacoesController');
const AuthMiddleware = require('../middlewares/authMiddleware');

router.use(AuthMiddleware.authenticateToken);

// POST /api/transacoes - Cadastrar nova transação
router.post('/', transacoesController.cadastrarTransacao);

// GET /api/transacoes - Listar transações com filtros
router.get('/', transacoesController.listarTransacoes);

// PUT /api/transacoes/:id - Atualizar transação ← ADICIONE ESTA LINHA
router.put('/:id', transacoesController.atualizarTransacao);

// Rota temporária para debug
router.get('/debug', transacoesController.debugBanco);

// GET /api/transacoes/analise-frequencia - Análise de frequência
router.get('/analise-frequencia', transacoesController.analiseFrequenciaGastos);

// PATCH /api/transacoes/:transacao_id/status - Atualizar status
router.patch('/:transacao_id/status', transacoesController.atualizarStatusPagamento);

module.exports = router;