import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Plus, Search, Wallet, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Conta } from '../types';
import { contasService } from '../services/contasService';
import toast from 'react-hot-toast';

export const Contas: React.FC = () => {
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadContas();
  }, []);

  const loadContas = async () => {
    try {
      setLoading(true);
      const data = await contasService.getAll();
      setContas(data);
    } catch (error) {
      toast.error('Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await contasService.delete(id);
        toast.success('Conta excluída com sucesso');
        loadContas();
      } catch (error) {
        toast.error('Erro ao excluir conta');
      }
    }
  };

  const filteredContas = contas.filter(conta =>
    conta.nome.toLowerCase().includes(search.toLowerCase())
  );

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      corrente: 'Conta Corrente',
      poupanca: 'Poupança',
      carteira: 'Carteira',
      investimento: 'Investimento'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Contas</h1>
        <Button icon={Plus}>
          Nova Conta
        </Button>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Buscar contas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Saldo Total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(contas.reduce((sum, conta) => sum + conta.saldo, 0))}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Contas Ativas</p>
                <p className="text-2xl font-bold text-green-900">{contas.length}</p>
              </div>
              <Wallet className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContas.map((conta) => (
          <Card key={conta.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-2 rounded-full"
                    style={{ backgroundColor: conta.cor, color: 'white' }}
                  >
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{conta.nome}</h3>
                    <p className="text-sm text-gray-500">{getTipoLabel(conta.tipo)}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400 hover:text-blue-600 rounded">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    onClick={() => handleDelete(conta.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Saldo:</span>
                  <span className={`text-lg font-semibold ${
                    conta.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(conta.saldo)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContas.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma conta encontrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};