const express = require('express');
const router = express.Router();
const colaboracaoController = require('../controllers/colaboracaoController');
const AuthMiddleware = require('../middlewares/authMiddleware');

router.use(AuthMiddleware.authenticateToken);

// GET /api/colaboracao/objetivos-compartilhados - Listar objetivos compartilhados
router.get('/objetivos-compartilhados', colaboracaoController.listarObjetivosCompartilhados);

// GET /api/colaboracao/convites-pendentes - Listar convites pendentes
router.get('/convites-pendentes', colaboracaoController.listarConvitesPendentes);

// POST /api/colaboracao/compartilhar - Compartilhar objetivo
router.post('/compartilhar', colaboracaoController.compartilharObjetivo);

// POST /api/colaboracao/responder-convite/:token - Responder convite
router.post('/responder-convite/:token', colaboracaoController.responderConvite);

// DELETE /api/colaboracao/compartilhamento/:id - Remover compartilhamento
router.delete('/compartilhamento/:id', colaboracaoController.removerCompartilhamento);

// GET /api/colaboracao/objetivos-que-compartilhei - Listar objetivos que eu compartilhei
router.get('/objetivos-que-compartilhei', colaboracaoController.listarObjetivosQueCompartilhei);

module.exports = router;