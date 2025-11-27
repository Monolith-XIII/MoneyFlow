import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface RegisterForm {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export const Register: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    watch 
  } = useForm<RegisterForm>();

  const senha = watch('senha');

  const onSubmit = async (data: RegisterForm) => {
    console.log('Dados do formulário:', data); // DEBUG
    try {
      await registerAuth({
        nome: data.nome,
        email: data.email,
        senha: data.senha
      });
      toast.success('Cadastro realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer cadastro');
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
          <p className="mt-2 text-sm text-gray-600">Crie sua conta</p>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Cadastrar</h3>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Nome */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Nome completo
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  {...register('nome', {
                    required: 'Nome é obrigatório'
                  })}
                />
                {errors.nome && (
                  <p className="text-danger text-sm">{errors.nome.message}</p>
                )}
              </div>

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

              {/* Confirmar Senha */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Confirmar senha
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  {...register('confirmarSenha', {
                    required: 'Confirme sua senha',
                    validate: value => value === senha || 'As senhas não coincidem'
                  })}
                />
                {errors.confirmarSenha && (
                  <p className="text-danger text-sm">{errors.confirmarSenha.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" loading={isSubmitting}>
                Cadastrar
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-primary hover:text-primary/80 text-sm">
                Já tem uma conta? Faça login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};