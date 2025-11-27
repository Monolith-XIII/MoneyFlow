import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { User, Lock, Bell, Moon, Trash2, Save } from 'lucide-react';
import { useAuth } from '../contexts/authContext';
import { usuarioService } from '../services/usuarioService';
import toast from 'react-hot-toast';

export const Configuracoes: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');
  const [loading, setLoading] = useState(false);

  // Estados do formulário de perfil
  const [perfil, setPerfil] = useState({
    nome: user?.nome || '',
    email: user?.email || ''
  });

  // Estados do formulário de senha
  const [senha, setSenha] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSalvarPerfil = async () => {
    try {
      setLoading(true);
      await usuarioService.updateProfile(perfil);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAlterarSenha = async () => {
    if (senha.newPassword !== senha.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (senha.newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await usuarioService.changePassword(senha.currentPassword, senha.newPassword);
      toast.success('Senha alterada com sucesso!');
      setSenha({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleDesativarConta = async () => {
    if (window.confirm('Tem certeza que deseja desativar sua conta? Esta ação não pode ser desfeita.')) {
      try {
        await usuarioService.desativarConta();
        toast.success('Conta desativada com sucesso');
        // Redirecionar para login
        window.location.href = '/login';
      } catch (error) {
        toast.error('Erro ao desativar conta');
      }
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Lock },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'aparencia', label: 'Aparência', icon: Moon }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu Lateral */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Conteúdo */}
        <div className="lg:col-span-3 space-y-6">
          {/* Perfil */}
          {activeTab === 'perfil' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Informações do Perfil</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome completo"
                    value={perfil.nome}
                    onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={perfil.email}
                    onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
                  />
                </div>
                <Button 
                  loading={loading}
                  onClick={handleSalvarPerfil}
                  icon={Save}
                >
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Segurança */}
          {activeTab === 'seguranca' && (
            <>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium">Alterar Senha</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Senha Atual"
                    type="password"
                    value={senha.currentPassword}
                    onChange={(e) => setSenha({ ...senha, currentPassword: e.target.value })}
                  />
                  <Input
                    label="Nova Senha"
                    type="password"
                    value={senha.newPassword}
                    onChange={(e) => setSenha({ ...senha, newPassword: e.target.value })}
                  />
                  <Input
                    label="Confirmar Nova Senha"
                    type="password"
                    value={senha.confirmPassword}
                    onChange={(e) => setSenha({ ...senha, confirmPassword: e.target.value })}
                  />
                  <Button 
                    loading={loading}
                    onClick={handleAlterarSenha}
                    icon={Lock}
                  >
                    Alterar Senha
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <h3 className="text-lg font-medium text-red-600">Zona de Perigo</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Ao desativar sua conta, todos os seus dados serão permanentemente excluídos. 
                      Esta ação não pode ser desfeita.
                    </p>
                    <Button 
                      variant="danger" 
                      onClick={handleDesativarConta}
                      icon={Trash2}
                    >
                      Desativar Minha Conta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Notificações */}
          {activeTab === 'notificacoes' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Preferências de Notificação</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Notificações por Email</p>
                    <p className="text-sm text-gray-600">Receba atualizações importantes por email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Lembretes de Contas</p>
                    <p className="text-sm text-gray-600">Notificações sobre contas a vencer</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Atualizações de Objetivos</p>
                    <p className="text-sm text-gray-600">Progresso dos objetivos financeiros</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Aparência */}
          {activeTab === 'aparencia' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Preferências de Aparência</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tema
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="border-2 border-blue-500 rounded-lg p-4 text-center">
                      <div className="w-full h-8 bg-white border rounded mb-2"></div>
                      <span className="text-sm font-medium">Claro</span>
                    </button>
                    <button className="border border-gray-300 rounded-lg p-4 text-center">
                      <div className="w-full h-8 bg-gray-800 border rounded mb-2"></div>
                      <span className="text-sm font-medium">Escuro</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idioma
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option>Português (Brasil)</option>
                    <option>English</option>
                    <option>Español</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};