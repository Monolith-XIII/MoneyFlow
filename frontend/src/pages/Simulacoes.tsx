import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Plus, Calculator, TrendingUp, Calendar, Target, Trash2 } from 'lucide-react';
import { simulacoesService } from '../services/simulacoesService';
import toast from 'react-hot-toast';

export const Simulacoes: React.FC = () => {
  const [simulacoes, setSimulacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [receitaAtual, setReceitaAtual] = useState('');
  const [despesaAtual, setDespesaAtual] = useState('');
  const [aumentoReceita, setAumentoReceita] = useState('0');
  const [reducaoDespesa, setReducaoDespesa] = useState('0');
  const [mesesProjecao, setMesesProjecao] = useState('12');

  useEffect(() => {
    loadSimulacoes();
  }, []);

  const loadSimulacoes = async () => {
    try {
      setLoading(true);
      const data = await simulacoesService.getAll();
      console.log('📊 Simulações carregadas:', data);
      setSimulacoes(data);
    } catch (error) {
      console.error('Erro ao carregar simulações:', error);
      toast.error('Erro ao carregar simulações');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta simulação?')) {
      try {
        await simulacoesService.delete(id);
        toast.success('Simulação excluída com sucesso');
        loadSimulacoes();
      } catch (error) {
        toast.error('Erro ao excluir simulação');
      }
    }
  };

  const handleNovaSimulacao = async () => {
    // Validações
    if (!nome.trim()) {
      toast.error('Nome da simulação é obrigatório');
      return;
    }

    if (!receitaAtual || !despesaAtual) {
      toast.error('Receita e despesa atuais são obrigatórias');
      return;
    }

    try {
      const simulacaoData = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        scenario_data: {
          receita_atual: parseFloat(receitaAtual),
          despesa_atual: parseFloat(despesaAtual),
          aumento_receitas_percentual: parseFloat(aumentoReceita),
          reducao_despesas_percentual: parseFloat(reducaoDespesa),
          meses_projecao: parseInt(mesesProjecao),
          investimento_mensal: 0,
          taxa_retorno_anual: 0
        }
      };

      console.log('🎯 Criando simulação com dados:', simulacaoData);
      
      const resultado = await simulacoesService.create(simulacaoData);
      
      toast.success('Simulação criada com sucesso!');
      
      // Limpar formulário
      setNome('');
      setDescricao('');
      setReceitaAtual('');
      setDespesaAtual('');
      setAumentoReceita('0');
      setReducaoDespesa('0');
      setMesesProjecao('12');
      setShowForm(false);
      
      // Recarregar lista
      loadSimulacoes();
      
    } catch (error: any) {
      console.error('Erro detalhado ao criar simulação:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar simulação');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Função para exibir resultados da simulação real
  const renderResultados = (simulacao: any) => {
    // Se for simulação real do backend
    if (simulacao.resultado && simulacao.resultado.resumo) {
      const { resumo } = simulacao.resultado;
      return (
        <div className="border-t pt-3">
          <h4 className="font-medium text-gray-900 mb-2">Resultados:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span>Saldo final: {formatCurrency(resumo.saldo_final)}</span>
            </div>
            <div className="flex items-center text-blue-600">
              <Target className="h-4 w-4 mr-2" />
              <span>Economia total: {formatCurrency(resumo.economia_total)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Receita projetada: {formatCurrency(resumo.receita_total_projetada)}</span>
            </div>
          </div>
        </div>
      );
    }
    
    // Se for simulação mock (fallback)
    return (
      <div className="border-t pt-3">
        <h4 className="font-medium text-gray-900 mb-2">Resultados:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-green-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span>Economia mensal: {formatCurrency(simulacao.resultado?.economia_mensal || 0)}</span>
          </div>
          <div className="flex items-center text-blue-600">
            <Target className="h-4 w-4 mr-2" />
            <span>Tempo reduzido: {simulacao.resultado?.tempo_objetivo_reduzido || 0} meses</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Simulações Financeiras</h1>
        <Button icon={Plus} onClick={() => setShowForm(!showForm)}>
          Nova Simulação
        </Button>
      </div>

      {/* Formulário de Nova Simulação */}
      {showForm && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Criar Nova Simulação</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Simulação *
                </label>
                <Input 
                  placeholder="Ex: Aumento de Renda" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <Input 
                  placeholder="Descreva o cenário..." 
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receita Atual (R$) *
                </label>
                <Input 
                  type="number" 
                  placeholder="5000" 
                  value={receitaAtual}
                  onChange={(e) => setReceitaAtual(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Despesa Atual (R$) *
                </label>
                <Input 
                  type="number" 
                  placeholder="3000" 
                  value={despesaAtual}
                  onChange={(e) => setDespesaAtual(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aumento de Receita (%)
                </label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={aumentoReceita}
                  onChange={(e) => setAumentoReceita(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Redução de Despesas (%)
                </label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={reducaoDespesa}
                  onChange={(e) => setReducaoDespesa(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meses de Projeção
                </label>
                <Input 
                  type="number" 
                  placeholder="12" 
                  value={mesesProjecao}
                  onChange={(e) => setMesesProjecao(e.target.value)}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleNovaSimulacao}>
                <Calculator className="h-4 w-4 mr-2" />
                Simular
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Simulações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {simulacoes.map((simulacao) => (
          <Card key={simulacao.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{simulacao.nome}</h3>
                    <p className="text-sm text-gray-500">{simulacao.descricao}</p>
                  </div>
                </div>
                <button 
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                  onClick={() => handleDelete(simulacao.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Criada em:</span>
                  <span className="text-gray-900">
                    {simulacao.created_at ? formatDate(simulacao.created_at) : formatDate(simulacao.data_criacao)}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-medium text-gray-900 mb-2">Parâmetros:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {simulacao.scenario_data ? (
                      <>
                        <div className="flex justify-between">
                          <span>Receita atual:</span>
                          <span>{formatCurrency(simulacao.scenario_data.receita_atual)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Despesa atual:</span>
                          <span>{formatCurrency(simulacao.scenario_data.despesa_atual)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Aumento receita:</span>
                          <span className="text-green-600">+{simulacao.scenario_data.aumento_receitas_percentual}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Redução despesas:</span>
                          <span className="text-red-600">-{simulacao.scenario_data.reducao_despesas_percentual}%</span>
                        </div>
                      </>
                    ) : (
                      // Fallback para dados mock
                      <>
                        <div className="flex justify-between">
                          <span>Aumento de Renda:</span>
                          <span className="text-green-600">+{simulacao.parametros?.aumento_renda}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Redução de Despesas:</span>
                          <span className="text-red-600">-{simulacao.parametros?.reducao_despesas}%</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {renderResultados(simulacao)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {simulacoes.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-12">
            <Calculator className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma simulação encontrada</p>
            <Button className="mt-4" icon={Plus} onClick={() => setShowForm(true)}>
              Criar Primeira Simulação
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};