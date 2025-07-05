import React from 'react';

interface InputProps {
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  label,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  const baseInputStyles = 
    'w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors duration-200';
  
  const inputStyles = `
    ${baseInputStyles}
    ${error 
      ? 'border-red-300 focus:ring-red-200 bg-red-50' 
      : 'border-gray-300 focus:ring-blue-200'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
    ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={inputStyles}
        aria-invalid={!!error}
      />
      
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;