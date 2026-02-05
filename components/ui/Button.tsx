
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-150 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: 'border-transparent text-white bg-brand-blue hover:bg-brand-blue-dark focus:ring-brand-blue-light',
    secondary: 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-brand-blue-light',
    ghost: 'border-transparent text-brand-blue-light hover:text-brand-blue dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-brand-blue-light',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
