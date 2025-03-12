import { ReactNode } from 'react';

type SwitcherProps = {
  children: ReactNode;
  type?: 'regular' | 'borderless';
  className?: string;
};

export default function Switcher({ 
  children,
   type = 'regular',
    className = '' }:
     SwitcherProps) 
     {
  return (
    <div className={`flex items-center gap-1 ${type === 'regular' ? 'bg-neutral-100 p-1 rounded-lg' : ''} ${className}`}>
      {children}
    </div>
  );
}
