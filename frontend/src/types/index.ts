export interface User {
  id: number;
  nome: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  data_transacao: string;
  categoria_id: number;
  conta_id: number;
  pago: boolean;
  recorrente: boolean;
  categoria?: Categoria;
  conta?: Conta;
}

export interface Categoria {
  id: number;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string;
  icone: string;
  usuario_id?: number;
}

export interface Conta {
  id: number;
  nome: string;
  saldo: number;
  tipo: 'corrente' | 'poupanca' | 'carteira' | 'investimento';
  cor: string;
  usuario_id: number;
}

export interface Objetivo {
  id: number;
  titulo: string;
  descricao: string;
  valor_objetivo: number;
  valor_atual: number;
  data_limite: string;
  cor: string;
  icone: string;
  usuario_id: number;
  compartilhado: boolean;
}

export interface Orcamento {
  id: number;
  categoria_id: number;
  valor: number;
  mes: number;
  ano: number;
  categoria?: Categoria;
}

export interface DashboardData {
  saldoAtual: number;
  receitasMes: number;
  despesasMes: number;
  contasPagar: number;
  evolucaoMensal: { mes: string; receitas: number; despesas: number }[];
  distribuicaoCategorias: { categoria: string; valor: number }[];
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
}