// src/components/Common/Select.tsx
import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  error = false,
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
    ? 'border-red-300 text-red-900'
    : disabled
      ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
      : 'border-gray-300 text-gray-900';

  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${className}`}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;


