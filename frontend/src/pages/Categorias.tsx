import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Plus, Search, Edit, Trash2, PieChart, X } from 'lucide-react';
import { Categoria } from '../types/index';
import { categoriasService } from '../services/categoriasService';
import toast from 'react-hot-toast';

export const Categorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);

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

  const handleNovaCategoria = () => {
    setEditingCategoria(null);
    setShowModal(true);
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategoria(null);
  };

  const handleSaveCategoria = async (categoriaData: Omit<Categoria, 'id'>) => {
    try {
      if (editingCategoria) {
        await categoriasService.update(editingCategoria.id, categoriaData);
        toast.success('Categoria atualizada com sucesso');
      } else {
        await categoriasService.create(categoriaData);
        toast.success('Categoria criada com sucesso');
      }
      handleCloseModal();
      loadCategorias();
    } catch (error) {
      toast.error(`Erro ao ${editingCategoria ? 'atualizar' : 'criar'} categoria`);
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
        <Button icon={Plus} onClick={handleNovaCategoria}>
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
              onEdit={() => handleEdit(categoria)}
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
              onEdit={() => handleEdit(categoria)}
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

      {/* Modal para criar/editar categoria */}
      {showModal && (
        <CategoriaModal
          categoria={editingCategoria}
          onSave={handleSaveCategoria}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

// Componente CategoriaCard (adicione esta parte no final do arquivo)
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

// Componente CategoriaModal
const CategoriaModal: React.FC<{
  categoria?: Categoria | null;
  onSave: (categoria: Omit<Categoria, 'id'>) => void;
  onClose: () => void;
}> = ({ categoria, onSave, onClose }) => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa');
  const [cor, setCor] = useState('#007bff');

  useEffect(() => {
    if (categoria) {
      setNome(categoria.nome);
      setTipo(categoria.tipo);
      setCor(categoria.cor);
    } else {
      setNome('');
      setTipo('despesa');
      setCor('#007bff');
    }
  }, [categoria]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    onSave({
      nome: nome.trim(),
      tipo,
      cor,
      icone: 'pie-chart'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {categoria ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome da categoria"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Alimentação, Salário..."
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tipo
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="receita"
                    checked={tipo === 'receita'}
                    onChange={(e) => setTipo(e.target.value as 'receita')}
                    className="mr-2"
                  />
                  Receita
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="despesa"
                    checked={tipo === 'despesa'}
                    onChange={(e) => setTipo(e.target.value as 'despesa')}
                    className="mr-2"
                  />
                  Despesa
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Cor
              </label>
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="w-full h-10 rounded border"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {categoria ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};