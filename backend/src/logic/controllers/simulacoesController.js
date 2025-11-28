const MoneyFlowDB = require('../../db/config');

class SimulacoesController {
  
  // Listar simulações do usuário
  async listarSimulacoes(req, res) {
    try {
      const { usuario_id } = req.user;

      const simulacoes = await new Promise((resolve, reject) => {
        MoneyFlowDB.all(
          `SELECT * FROM simulacoes 
           WHERE usuario_id = ? 
           ORDER BY created_at DESC`,
          [usuario_id],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      // Parse dos resultados JSON
      const simulacoesComResultado = simulacoes.map(simulacao => ({
        ...simulacao,
        scenario_data: JSON.parse(simulacao.scenario_data || '{}'),
        resultado: JSON.parse(simulacao.resultado || '{}')
      }));

      res.json(simulacoesComResultado);

    } catch (error) {
      console.error('Erro ao listar simulações:', error);
      res.status(500).json({ error: 'Erro ao buscar simulações' });
    }
  }

  // Buscar simulação por ID
  async buscarSimulacao(req, res) {
    try {
      const { usuario_id } = req.user;
      const { id } = req.params;

      const simulacao = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          'SELECT * FROM simulacoes WHERE id = ? AND usuario_id = ?',
          [id, usuario_id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!simulacao) {
        return res.status(404).json({ error: 'Simulação não encontrada' });
      }

      // Parse dos resultados JSON
      simulacao.scenario_data = JSON.parse(simulacao.scenario_data || '{}');
      simulacao.resultado = JSON.parse(simulacao.resultado || '{}');

      res.json(simulacao);

    } catch (error) {
      console.error('Erro ao buscar simulação:', error);
      res.status(500).json({ error: 'Erro ao buscar simulação' });
    }
  }

  // Criar simulação
  async criarSimulacao(req, res) {
    try {
      const { usuario_id } = req.user;
      const { nome, descricao, scenario_data } = req.body;

      console.log('📥 Dados recebidos no backend:', { nome, descricao, scenario_data });

      if (!nome || !scenario_data) {
        return res.status(400).json({ error: 'Nome e dados do cenário são obrigatórios' });
      }

      if (!scenario_data.receita_atual || !scenario_data.despesa_atual) {
        return res.status(400).json({ error: 'Receita atual e despesa atual são obrigatórias' });
      }

      // Simular impacto financeiro - CHAMADA CORRIGIDA
      const resultado = SimulacoesController.simularCenario(scenario_data);

      console.log('🎯 Resultado da simulação:', resultado);

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          `INSERT INTO simulacoes 
           (nome, descricao, scenario_data, resultado, usuario_id) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            nome,
            descricao || '',
            JSON.stringify(scenario_data),
            JSON.stringify(resultado),
            usuario_id
          ],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      res.status(201).json({
        message: 'Simulação criada com sucesso',
        simulacao_id: result.id,
        resultado: resultado
      });

    } catch (error) {
      console.error('Erro ao criar simulação:', error);
      res.status(500).json({ error: 'Erro ao criar simulação' });
    }
  }

  // Simular cenário - MÉTODO ESTÁTICO (corrigido)
  static simularCenario(scenario_data) {
    const {
      receita_atual,
      despesa_atual,
      reducao_despesas_percentual = 0,
      aumento_receitas_percentual = 0,
      meses_projecao = 12,
      investimento_mensal = 0,
      taxa_retorno_anual = 0
    } = scenario_data;

    console.log('🔧 Simulando cenário com dados:', scenario_data);

    const resultados = {
      saldo_atual: receita_atual - despesa_atual,
      projecao_mensal: [],
      resumo: {}
    };

    let saldo_acumulado = receita_atual - despesa_atual;
    let investimento_acumulado = 0;

    for (let mes = 1; mes <= meses_projecao; mes++) {
      const receita_projetada = receita_atual * (1 + aumento_receitas_percentual / 100);
      const despesa_projetada = despesa_atual * (1 - reducao_despesas_percentual / 100);
      const saldo_mensal = receita_projetada - despesa_projetada;
      
      // Calcular retorno do investimento
      const retorno_mensal = investimento_acumulado * (taxa_retorno_anual / 100 / 12);
      investimento_acumulado += investimento_mensal + retorno_mensal;
      
      saldo_acumulado += saldo_mensal + retorno_mensal;

      resultados.projecao_mensal.push({
        mes,
        receita: Math.round(receita_projetada),
        despesa: Math.round(despesa_projetada),
        saldo_mensal: Math.round(saldo_mensal),
        investimento_acumulado: Math.round(investimento_acumulado),
        saldo_total_acumulado: Math.round(saldo_acumulado)
      });
    }

    // Calcular resumo
    const ultimoMes = resultados.projecao_mensal[resultados.projecao_mensal.length - 1];
    resultados.resumo = {
      saldo_final: Math.round(ultimoMes.saldo_total_acumulado),
      investimento_total: Math.round(ultimoMes.investimento_acumulado),
      economia_total: Math.round((despesa_atual * meses_projecao) - resultados.projecao_mensal.reduce((sum, mes) => sum + mes.despesa, 0)),
      receita_total_projetada: Math.round(resultados.projecao_mensal.reduce((sum, mes) => sum + mes.receita, 0)),
      despesa_total_projetada: Math.round(resultados.projecao_mensal.reduce((sum, mes) => sum + mes.despesa, 0))
    };

    console.log('📈 Resultado final da simulação:', resultados.resumo);
    return resultados;
  }

  // Deletar simulação
  async deletarSimulacao(req, res) {
    try {
      const { usuario_id } = req.user;
      const { id } = req.params;

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          'DELETE FROM simulacoes WHERE id = ? AND usuario_id = ?',
          [id, usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Simulação não encontrada' });
      }

      res.json({ message: 'Simulação deletada com sucesso' });

    } catch (error) {
      console.error('Erro ao deletar simulação:', error);
      res.status(500).json({ error: 'Erro ao deletar simulação' });
    }
  }
}

module.exports = new SimulacoesController();