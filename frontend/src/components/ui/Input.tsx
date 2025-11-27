import React from 'react';
import { UseFormRegister } from 'react-hook-form';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  register?: any; // Mudança importante aqui
  name?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  register,
  name,
  className = '',
  ...props
}) => {
  const inputClasses = `w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
    error ? 'border-danger' : 'border-gray-300'
  } ${className}`;

  // Renderização condicional CORRETA
  if (register && name) {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          {...register(name)}
          className={inputClasses}
          {...props}
        />
        {error && <p className="text-danger text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input className={inputClasses} {...props} />
      {error && <p className="text-danger text-sm">{error}</p>}
    </div>
  );
};