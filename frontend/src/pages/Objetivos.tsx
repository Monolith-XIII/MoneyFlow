import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Plus, Search, Target, Calendar, Users, Edit, Trash2, PlusCircle } from 'lucide-react';
import { Objetivo } from '../types';
import { objetivosService } from '../services/objetivosService';
import toast from 'react-hot-toast';

export const Objetivos: React.FC = () => {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadObjetivos();
  }, []);

  const loadObjetivos = async () => {
    try {
      setLoading(true);
      const data = await objetivosService.getAll();
      setObjetivos(data);
    } catch (error) {
      toast.error('Erro ao carregar objetivos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este objetivo?')) {
      try {
        await objetivosService.delete(id);
        toast.success('Objetivo excluído com sucesso');
        loadObjetivos();
      } catch (error) {
        toast.error('Erro ao excluir objetivo');
      }
    }
  };

  const calcularProgresso = (objetivo: Objetivo) => {
    return (objetivo.valor_atual / objetivo.valor_objetivo) * 100;
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

  const filteredObjetivos = objetivos.filter(objetivo =>
    objetivo.titulo.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Objetivos Financeiros</h1>
        <Button icon={Plus}>
          Novo Objetivo
        </Button>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Buscar objetivos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </CardContent>
      </Card>

      {/* Lista de Objetivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredObjetivos.map((objetivo) => {
          const progresso = calcularProgresso(objetivo);
          const faltam = objetivo.valor_objetivo - objetivo.valor_atual;
          
          return (
            <Card key={objetivo.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-2 rounded-full"
                      style={{ backgroundColor: objetivo.cor, color: 'white' }}
                    >
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{objetivo.titulo}</h3>
                      <p className="text-sm text-gray-500">{objetivo.descricao}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {objetivo.compartilhado && (
                      <Users className="h-4 w-4 text-blue-500" />
                    )}
                    <button className="p-1 text-gray-400 hover:text-blue-600 rounded">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      onClick={() => handleDelete(objetivo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{formatCurrency(objetivo.valor_atual)}</span>
                    <span>{formatCurrency(objetivo.valor_objetivo)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(progresso, 100)}%`,
                        backgroundColor: objetivo.cor
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{progresso.toFixed(1)}% concluído</span>
                    <span>Faltam {formatCurrency(faltam)}</span>
                  </div>
                </div>

                {/* Informações */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Vence em {formatDate(objetivo.data_limite)}</span>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button size="sm" variant="outline" icon={PlusCircle}>
                      Contribuir
                    </Button>
                    {objetivo.compartilhado && (
                      <Button size="sm" variant="outline" icon={Users}>
                        Colaboradores
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredObjetivos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum objetivo encontrado</p>
            <Button className="mt-4" icon={Plus}>
              Criar Primeiro Objetivo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};