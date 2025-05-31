import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
}

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  className = '', 
  ...props 
}: ButtonProps) => {
  const buttonClass = `button button--${variant} button--${size} ${className}`;
  
  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};

export default Button; 