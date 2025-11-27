import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Users, Mail, Target, Clock, Check, X, Share2 } from 'lucide-react';
import { colaboracaoService } from '../services/colaboracaoService';
import toast from 'react-hot-toast';

export const Colaboracao: React.FC = () => {
  const [objetivosCompartilhados, setObjetivosCompartilhados] = useState<any[]>([]);
  const [convitesPendentes, setConvitesPendentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailCompartilhamento, setEmailCompartilhamento] = useState('');
  const [objetivoSelecionado, setObjetivoSelecionado] = useState('');

  useEffect(() => {
    loadDados();
  }, []);

  const loadDados = async () => {
    try {
      setLoading(true);
      const [objetivos, convites] = await Promise.all([
        colaboracaoService.getObjetivosCompartilhados(),
        colaboracaoService.getConvitesPendentes()
      ]);
      setObjetivosCompartilhados(objetivos);
      setConvitesPendentes(convites);
    } catch (error) {
      toast.error('Erro ao carregar dados de colaboração');
    } finally {
      setLoading(false);
    }
  };

  const handleCompartilhar = async () => {
    if (!emailCompartilhamento || !objetivoSelecionado) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      await colaboracaoService.compartilharObjetivo(
        parseInt(objetivoSelecionado),
        emailCompartilhamento
      );
      toast.success('Convite enviado com sucesso!');
      setEmailCompartilhamento('');
      setObjetivoSelecionado('');
    } catch (error) {
      toast.error('Erro ao enviar convite');
    }
  };

  const handleResponderConvite = async (token: string, aceitar: boolean) => {
    try {
      await colaboracaoService.responderConvite(token, aceitar);
      toast.success(aceitar ? 'Convite aceito!' : 'Convite recusado');
      loadDados();
    } catch (error) {
      toast.error('Erro ao processar convite');
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

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Colaboração</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compartilhar Objetivo */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">Compartilhar Objetivo</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecione o objetivo
              </label>
              <select
                value={objetivoSelecionado}
                onChange={(e) => setObjetivoSelecionado(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Selecione um objetivo</option>
                <option value="1">Viagem para Europa</option>
                <option value="2">Notebook Novo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email do colaborador
              </label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={emailCompartilhamento}
                onChange={(e) => setEmailCompartilhamento(e.target.value)}
                icon={Mail}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleCompartilhar}
              disabled={!emailCompartilhamento || !objetivoSelecionado}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Enviar Convite
            </Button>
          </CardContent>
        </Card>

        {/* Convites Pendentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-medium">Convites Pendentes</h3>
            </div>
          </CardHeader>
          <CardContent>
            {convitesPendentes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhum convite pendente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {convitesPendentes.map((convite) => (
                  <div key={convite.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {convite.objetivo.titulo}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {formatDate(convite.data_convite)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Convite de: {convite.proprietario.nome} ({convite.proprietario.email})
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleResponderConvite(convite.token, true)}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResponderConvite(convite.token, false)}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Recusar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Objetivos Compartilhados */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-medium">Objetivos Compartilhados</h3>
          </div>
        </CardHeader>
        <CardContent>
          {objetivosCompartilhados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum objetivo compartilhado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {objetivosCompartilhados.map((objetivo) => (
                <div key={objetivo.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{objetivo.titulo}</h4>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {objetivo.participantes} participantes
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{objetivo.descricao}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Progresso:</span>
                      <span>
                        {formatCurrency(objetivo.valor_atual)} / {formatCurrency(objetivo.valor_objetivo)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500"
                        style={{
                          width: `${(objetivo.valor_atual / objetivo.valor_objetivo) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Proprietário: {objetivo.proprietario.nome}</span>
                      <span>Vence em {formatDate(objetivo.data_limite)}</span>
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