import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  DollarSign,
  PieChart,
  Target,
  Wallet,
  Settings,
  X,
  Users,
  BarChart3,
  Calculator
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Transações', href: '/transacoes', icon: DollarSign },
  { name: 'Categorias', href: '/categorias', icon: PieChart },
  { name: 'Contas', href: '/contas', icon: Wallet },
  { name: 'Objetivos', href: '/objetivos', icon: Target },
  { name: 'Orçamentos', href: '/orcamentos', icon: BarChart3 },
  { name: 'Colaboração', href: '/colaboracao', icon: Users },
  { name: 'Simulações', href: '/simulacoes', icon: Calculator },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  return (
    <>
      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <DollarSign className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold">Money Flow</span>
                <button
                  className="ml-auto p-2 rounded-md text-gray-400 hover:text-gray-500"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                    onClick={() => setOpen(false)}
                  >
                    <item.icon className="mr-4 h-6 w-6" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 py-5">
              <DollarSign className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">Money Flow</span>
            </div>
            <div className="flex-grow flex flex-col">
              <nav className="flex-1 px-2 pb-4 space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};