import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginForm {
  email: string;
  senha: string;
}

export const Login: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginForm>();

  // Debug: monitorar estado do usuário
  useEffect(() => {
    console.log('👤 Estado do usuário:', user);
  }, [user]);

  const onSubmit = async (data: LoginForm) => {
    console.log('📝 Dados do formulário:', data);
    
    try {
      console.log('🔄 Iniciando processo de login...');
      
      // Fazer login
      const result = await login(data.email, data.senha);
      console.log('✅ Resultado do login:', result);
      
      // Verificar localStorage
      const tokenAfterLogin = localStorage.getItem('token');
      const userAfterLogin = localStorage.getItem('user');
      console.log('💾 localStorage após login completo:', { 
        token: tokenAfterLogin,
        tokenLength: tokenAfterLogin?.length,
        user: userAfterLogin 
      });
      
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard', { replace: true });
      
    } catch (error: any) {
      console.error('❌ Erro completo no login:', error);
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <DollarSign className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Money Flow</h2>
          <p className="mt-2 text-sm text-gray-600">Faça login na sua conta</p>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Entrar</h3>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Email */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  {...register('email', {
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Email inválido'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-danger text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  {...register('senha', {
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres'
                    }
                  })}
                />
                {errors.senha && (
                  <p className="text-danger text-sm">{errors.senha.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" loading={isSubmitting}>
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/register" className="text-primary hover:text-primary/80 text-sm">
                Não tem uma conta? Cadastre-se
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};