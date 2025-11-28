// components/CategoriaModal.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { X } from 'lucide-react';
import { Categoria } from '../../types/index';

interface CategoriaModalProps {
  categoria?: Categoria | null;
  onSave: (categoria: Omit<Categoria, 'id'>) => void;
  onClose: () => void;
}

export const CategoriaModal: React.FC<CategoriaModalProps> = ({
  categoria,
  onSave,
  onClose
}) => {
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
      icone: 'pie-chart' // Você pode adicionar um seletor de ícones depois
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