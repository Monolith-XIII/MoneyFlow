const express = require('express');
const router = express.Router();

// Importação de todas as rotas
const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const transacoesRoutes = require('./transacoesRoutes');
const categoriasRoutes = require('./categoriasRoutes');
const contasRoutes = require('./contasRoutes');
const objetivosRoutes = require('./objetivosRoutes');
const orcamentosRoutes = require('./orcamentosRoutes');
const colaboracaoRoutes = require('./colaboracaoRoutes');
const simulacoesRoutes = require('./simulacoesRoutes');
const usuarioRoutes = require('./usuarioRoutes');

// Definição das rotas
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/transacoes', transacoesRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/contas', contasRoutes);
router.use('/objetivos', objetivosRoutes);
router.use('/orcamentos', orcamentosRoutes);
router.use('/colaboracao', colaboracaoRoutes);
router.use('/simulacoes', simulacoesRoutes);
router.use('/usuario', usuarioRoutes);

// Rota de documentação básica
router.get('/docs', (req, res) => {
  res.json({
    message: 'Money Flow API Documentation',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      transacoes: '/api/transacoes',
      categorias: '/api/categorias',
      contas: '/api/contas',
      objetivos: '/api/objetivos',
      orcamentos: '/api/orcamentos',
      colaboracao: '/api/colaboracao',
      simulacoes: '/api/simulacoes',
      usuario: '/api/usuario'
    }
  });
});

module.exports = router;