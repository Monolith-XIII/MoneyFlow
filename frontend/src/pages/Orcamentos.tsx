import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Plus, Search, PieChart, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { Orcamento } from '../types';
import { orcamentosService } from '../services/orcamentosService';
import toast from 'react-hot-toast';

export const Orcamentos: React.FC = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

  useEffect(() => {
    loadOrcamentos();
  }, [mesSelecionado, anoSelecionado]);

  const loadOrcamentos = async () => {
    try {
      setLoading(true);
      const data = await orcamentosService.getAll();
      // Filtrar por mês/ano (no backend real isso seria feito na API)
      const orcamentosFiltrados = data.filter(
        o => o.mes === mesSelecionado && o.ano === anoSelecionado
      );
      setOrcamentos(orcamentosFiltrados);
    } catch (error) {
      toast.error('Erro ao carregar orçamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        await orcamentosService.delete(id);
        toast.success('Orçamento excluído com sucesso');
        loadOrcamentos();
      } catch (error) {
        toast.error('Erro ao excluir orçamento');
      }
    }
  };

  const calcularTotalOrcado = () => {
    return orcamentos.reduce((total, orcamento) => total + orcamento.valor, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMeses = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: new Date(2000, i).toLocaleDateString('pt-BR', { month: 'long' })
    }));
  };

  const getAnos = () => {
    const anoAtual = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => anoAtual - 2 + i);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
        <Button icon={Plus}>
          Novo Orçamento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <select
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                {getMeses().map(mes => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
              <select
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                {getAnos().map(ano => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Buscar orçamentos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Search}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Orçado</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(calcularTotalOrcado())}
                </p>
              </div>
              <PieChart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Categorias</p>
                <p className="text-2xl font-bold text-orange-900">{orcamentos.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Orçamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orcamentos.map((orcamento) => (
          <Card key={orcamento.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-2 rounded-full"
                    style={{ backgroundColor: orcamento.categoria?.cor, color: 'white' }}
                  >
                    <PieChart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {orcamento.categoria?.nome}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {orcamento.mes}/{orcamento.ano}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400 hover:text-blue-600 rounded">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    onClick={() => handleDelete(orcamento.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Orçamento:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(orcamento.valor)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Gasto real:</span>
                  <span className="text-gray-900">
                    {formatCurrency(orcamento.valor * 0.7)} {/* Mock */}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    (orcamento.valor * 0.7) > orcamento.valor 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {(orcamento.valor * 0.7) > orcamento.valor ? 'Excedido' : 'Dentro do orçamento'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orcamentos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum orçamento encontrado para este período</p>
            <Button className="mt-4" icon={Plus}>
              Criar Primeiro Orçamento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};