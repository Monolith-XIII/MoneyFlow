import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Plus, Search, Filter, Edit, Trash2, ArrowUpCircle, ArrowDownCircle, X } from 'lucide-react';
import { Transacao } from '../types/index';
import { transacoesService } from '../services/transacoesService';
import { categoriasService } from '../services/categoriasService';
import { contasService } from '../services/contasService';
import toast from 'react-hot-toast';

export const Transacoes: React.FC = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null);

  useEffect(() => {
    loadTransacoes();
  }, []);

  const loadTransacoes = async () => {
    try {
      setLoading(true);
      const data = await transacoesService.getAll();
      console.log('📊 Dados carregados:', data);
      
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

  const handleNovaTransacao = () => {
    setEditingTransacao(null);
    setShowModal(true);
  };

  const handleEdit = (transacao: Transacao) => {
    setEditingTransacao(transacao);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTransacao(null);
  };

  const handleSaveTransacao = async (transacaoData: Omit<Transacao, 'id'>) => {
    try {
      if (editingTransacao) {
        // ATUALIZAR transação existente
        await transacoesService.update(editingTransacao.id, transacaoData);
        toast.success('Transação atualizada com sucesso');
      } else {
        // CRIAR nova transação
        await transacoesService.create(transacaoData);
        toast.success('Transação criada com sucesso');
      }
      handleCloseModal();
      loadTransacoes();
    } catch (error) {
      toast.error(`Erro ao ${editingTransacao ? 'atualizar' : 'criar'} transação`);
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
        <Button icon={Plus} onClick={handleNovaTransacao}>
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
                      <button 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        onClick={() => handleEdit(transacao)}
                      >
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

      {/* Modal para criar/editar transação */}
      {showModal && (
        <TransacaoModal
          transacao={editingTransacao}
          onSave={handleSaveTransacao}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

// Componente TransacaoModal
const TransacaoModal: React.FC<{
  transacao?: Transacao | null;
  onSave: (transacao: Omit<Transacao, 'id'>) => void;
  onClose: () => void;
}> = ({ transacao, onSave, onClose }) => {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [categoriaId, setCategoriaId] = useState('1');
  const [contaId, setContaId] = useState('1');
  const [pago, setPago] = useState(false);
  const [recorrente, setRecorrente] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carrega categorias
        const cats = await categoriasService.getAll();
        setCategorias(cats);
        
        // Carrega contas
        const contasData = await contasService.getAll();
        setContas(contasData);
        
        // Seta valores padrão
        if (contasData.length > 0 && !contaId) {
          setContaId(contasData[0].id.toString());
        }
        if (cats.length > 0 && !categoriaId) {
          const primeiraCategoria = cats.find(cat => cat.tipo === tipo);
          if (primeiraCategoria) {
            setCategoriaId(primeiraCategoria.id.toString());
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    loadData();
  }, [tipo]); // Recarrega quando o tipo muda

  useEffect(() => {
    // Carregar categorias e contas
    const loadData = async () => {
      try {
        const cats = await categoriasService.getAll();
        setCategorias(cats);
        // Também carregar contas quando tiver o service
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (transacao) {
      setDescricao(transacao.descricao);
      setValor(transacao.valor.toString());
      setTipo(transacao.tipo);
      setData(transacao.data_transacao.split('T')[0]);
      setCategoriaId(transacao.categoria_id.toString());
      setContaId(transacao.conta_id.toString());
      setPago(transacao.pago);
      setRecorrente(transacao.recorrente);
    } else {
      setDescricao('');
      setValor('');
      setTipo('despesa');
      setData(new Date().toISOString().split('T')[0]);
      setCategoriaId('1');
      setContaId('1');
      setPago(false);
      setRecorrente(false);
    }
  }, [transacao]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || !valor || !categoriaId || !contaId) return;

    onSave({
      descricao: descricao.trim(),
      valor: parseFloat(valor),
      tipo,
      data_transacao: data + 'T00:00:00.000Z',
      categoria_id: parseInt(categoriaId),
      conta_id: parseInt(contaId),
      pago,
      recorrente
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {transacao ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Salário, Aluguel..."
              required
            />
            
            <Input
              label="Valor"
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            <Input
              label="Data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias
                  .filter(cat => cat.tipo === tipo) // Filtra por tipo (receita/despesa)
                  .map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))
                }
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conta
              </label>
              <select
                value={contaId}
                onChange={(e) => setContaId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Selecione uma conta</option>
                {contas.map(conta => (
                  <option key={conta.id} value={conta.id}>
                    {conta.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="pago"
                checked={pago}
                onChange={(e) => setPago(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="pago" className="text-sm text-gray-700">
                Marcado como pago
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="recorrente"
                checked={recorrente}
                onChange={(e) => setRecorrente(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="recorrente" className="text-sm text-gray-700">
                Transação recorrente
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {transacao ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};