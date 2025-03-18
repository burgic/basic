// src/components/Common/Input.tsx
import React from 'react';

interface InputProps {
  id: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  autoComplete?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = false,
  autoComplete,
  className = '',
}) => {
  const baseClasses = `
    w-full 
    px-3 
    py-2 
    border 
    rounded-lg 
    shadow-sm 
    focus:outline-none 
    focus:ring-2 
    focus:ring-blue-500 
    focus:border-transparent
  `;

  const stateClasses = error
    ? 'border-red-300 text-red-900 placeholder-red-300'
    : disabled
      ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
      : 'border-gray-300 text-gray-900';

  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      autoComplete={autoComplete}
      className={`${baseClasses} ${stateClasses} ${className}`}
    />
  );
};

export default Input;

