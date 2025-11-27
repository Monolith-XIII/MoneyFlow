import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Plus, Search, Filter, Edit, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Transacao } from '../types';
import { transacoesService } from '../services/transacoesService';
import toast from 'react-hot-toast';

export const Transacoes: React.FC = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTransacoes();
  }, []);

  const loadTransacoes = async () => {
    try {
      setLoading(true);
      const data = await transacoesService.getAll();
      console.log('📊 Dados carregados:', data);
      
      // Garantir que é um array
      if (Array.isArray(data)) {
        setTransacoes(data);
      } else {
        console.error('❌ Dados não são um array:', data);
        setTransacoes([]);
        toast.error('Erro ao carregar transações: formato inválido');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar transações:', error);
      toast.error('Erro ao carregar transações');
      setTransacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await transacoesService.delete(id);
        toast.success('Transação excluída com sucesso');
        loadTransacoes();
      } catch (error) {
        toast.error('Erro ao excluir transação');
      }
    }
  };

  // Proteção contra erro - garantir que transacoes é array antes de usar filter
  const filteredTransacoes = Array.isArray(transacoes) 
    ? transacoes.filter(transacao =>
        transacao.descricao?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
        <Button icon={Plus}>
          Nova Transação
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar transações..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Search}
              />
            </div>
            <Button variant="outline" icon={Filter}>
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">
            Transações ({filteredTransacoes.length})
          </h3>
        </CardHeader>
        <CardContent>
          {filteredTransacoes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransacoes.map((transacao) => (
                <div
                  key={transacao.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      transacao.tipo === 'receita' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transacao.tipo === 'receita' ? (
                        <ArrowUpCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">
                        {transacao.descricao}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{formatDate(transacao.data_transacao)}</span>
                        <span>•</span>
                        <span>{transacao.categoria?.nome || 'Sem categoria'}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transacao.pago 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transacao.pago ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <p className={`text-lg font-semibold ${
                      transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transacao.tipo === 'receita' ? '+' : '-'} {formatCurrency(transacao.valor)}
                    </p>
                    
                    <div className="flex space-x-1">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        onClick={() => handleDelete(transacao.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};