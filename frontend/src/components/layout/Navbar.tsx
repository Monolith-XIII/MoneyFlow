import React from 'react';
import { useAuth } from '../../contexts/authContext';
import { Button } from '../ui/Button';
import { Menu, User, LogOut, Bell, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Botão menu mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Título da página atual (opcional) */}
        <div className="flex-1 md:flex-none md:ml-6">
          <h1 className="text-lg font-semibold text-gray-900">
            Money Flow
          </h1>
        </div>

        {/* User menu e notificações */}
        <div className="flex items-center space-x-4">
          {/* Botão de notificações */}
          <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>

          {/* User info */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-sm font-medium text-gray-900">
                {user?.nome}
              </span>
              <span className="text-xs text-gray-500">
                {user?.email}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.nome?.charAt(0).toUpperCase()}
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Botão sair desktop */}
          <Button
            variant="outline"
            size="sm"
            icon={LogOut}
            onClick={logout}
            className="hidden sm:flex"
          >
            Sair
          </Button>
          
          {/* Botão sair mobile */}
          <button
            onClick={logout}
            className="sm:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};