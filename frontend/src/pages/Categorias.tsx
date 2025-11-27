import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Plus, Search, Edit, Trash2, PieChart } from 'lucide-react';
import { Categoria } from '../types';
import { categoriasService } from '../services/categoriasService';
import toast from 'react-hot-toast';

export const Categorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriasService.getAll();
      setCategorias(data);
    } catch (error) {
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await categoriasService.delete(id);
        toast.success('Categoria excluída com sucesso');
        loadCategorias();
      } catch (error) {
        toast.error('Erro ao excluir categoria');
      }
    }
  };

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(search.toLowerCase())
  );

  const categoriasReceita = filteredCategorias.filter(c => c.tipo === 'receita');
  const categoriasDespesa = filteredCategorias.filter(c => c.tipo === 'despesa');

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-neutral-900">Categorias</h1>
        <Button icon={Plus}>
          Nova Categoria
        </Button>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Buscar categorias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </CardContent>
      </Card>

      {/* Categorias de Receita */}
      <div>
        <h2 className="text-xl font-semibold text-success mb-4">Receitas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriasReceita.map((categoria) => (
            <CategoriaCard
              key={categoria.id}
              categoria={categoria}
              onEdit={() => {/* Implementar edição */}}
              onDelete={() => handleDelete(categoria.id)}
            />
          ))}
          {categoriasReceita.length === 0 && (
            <div className="col-span-full text-center py-8 text-neutral-500">
              <PieChart className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
              <p>Nenhuma categoria de receita encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Categorias de Despesa */}
      <div>
        <h2 className="text-xl font-semibold text-danger mb-4">Despesas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriasDespesa.map((categoria) => (
            <CategoriaCard
              key={categoria.id}
              categoria={categoria}
              onEdit={() => {/* Implementar edição */}}
              onDelete={() => handleDelete(categoria.id)}
            />
          ))}
          {categoriasDespesa.length === 0 && (
            <div className="col-span-full text-center py-8 text-neutral-500">
              <PieChart className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
              <p>Nenhuma categoria de despesa encontrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CategoriaCardProps {
  categoria: Categoria;
  onEdit: () => void;
  onDelete: () => void;
}

const CategoriaCard: React.FC<CategoriaCardProps> = ({ categoria, onEdit, onDelete }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: `${categoria.cor}20`, color: categoria.cor }}
            >
              {/* Ícone placeholder - você pode usar lucide icons baseados no nome do ícone */}
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">{categoria.nome}</h3>
              <p className={`text-sm ${
                categoria.tipo === 'receita' ? 'text-success' : 'text-danger'
              }`}>
                {categoria.tipo === 'receita' ? 'Receita' : 'Despesa'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <button 
              className="p-1 text-neutral-400 hover:text-primary rounded"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </button>
            <button 
              className="p-1 text-neutral-400 hover:text-danger rounded"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};