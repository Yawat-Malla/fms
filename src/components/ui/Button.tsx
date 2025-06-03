import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  animation?: 'pulse' | 'scale' | 'none';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  animation = 'scale',
  ...props
}: ButtonProps) {
  // Base style for all buttons
  const baseStyle = 'inline-flex items-center justify-center border font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-800 transition-all duration-200 ease-out';
  
  // Variant styles for dark mode
  const variantStyles = {
    primary: 'bg-primary-600 border-transparent text-white hover:bg-primary-500 focus:ring-primary-500 disabled:bg-primary-600/70 shadow-sm hover:shadow',
    secondary: 'bg-dark-600 border-transparent text-dark-100 hover:bg-dark-500 focus:ring-dark-400 disabled:bg-dark-600/70 shadow-sm hover:shadow',
    danger: 'bg-red-600 border-transparent text-white hover:bg-red-500 focus:ring-red-500 disabled:bg-red-600/70 shadow-sm hover:shadow',
    success: 'bg-green-600 border-transparent text-white hover:bg-green-500 focus:ring-green-500 disabled:bg-green-600/70 shadow-sm hover:shadow',
    warning: 'bg-yellow-500 border-transparent text-white hover:bg-yellow-400 focus:ring-yellow-500 disabled:bg-yellow-500/70 shadow-sm hover:shadow',
    outline: 'bg-transparent border-dark-600 text-dark-200 hover:bg-dark-700/50 hover:border-dark-500 focus:ring-dark-400',
    ghost: 'bg-transparent border-transparent text-dark-200 hover:bg-dark-700/30 focus:ring-dark-400',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Width styles
  const widthStyle = fullWidth ? 'w-full' : '';

  // Animation styles
  const animationStyles = {
    scale: 'active:scale-95',
    pulse: 'btn-pulse',
    none: '',
  };

  // Disabled and loading styles
  const stateStyles = (disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : '';

  // Combine all styles
  const buttonClassName = [
    baseStyle,
    variantStyles[variant],
    sizeStyles[size],
    widthStyle,
    animationStyles[animation],
    stateStyles,
    className,
  ].filter(Boolean).join(' ').trim();

  return (
    <button
      className={buttonClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!isLoading && leftIcon && <span className="mr-2 transition-transform duration-200 group-hover:translate-x-[-2px]">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="ml-2 transition-transform duration-200 group-hover:translate-x-[2px]">{rightIcon}</span>}
    </button>
  );
} 