import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary-pill' | 'dark-utility' | 'pearl-capsule' | 'icon-circular' | 'store-hero' | 'danger';
  children?: React.ReactNode;
}

export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  let baseStyles = "inline-flex items-center justify-center font-sans font-normal active-scale focus:outline-none transition-all duration-150";
  let variantStyles = "";

  switch (variant) {
    case 'primary':
      variantStyles = "bg-apple-primary text-white hover:bg-apple-primary-focus rounded-full text-[15px] px-[22px] py-[11px]";
      break;
    case 'secondary-pill':
      variantStyles = "bg-transparent text-apple-primary hover:bg-apple-divider-soft border border-apple-primary rounded-full text-[15px] px-[22px] py-[11px]";
      break;
    case 'dark-utility':
      variantStyles = "bg-apple-ink text-white hover:opacity-90 rounded-apple-sm text-[14px] tracking-[-0.224px] px-[15px] py-[8px]";
      break;
    case 'pearl-capsule':
      variantStyles = "bg-apple-surface-pearl text-apple-ink-muted-80 border-2 border-apple-divider-soft rounded-apple-md text-[14px] px-[14px] py-[8px] hover:bg-apple-canvas-parchment";
      break;
    case 'store-hero':
      variantStyles = "bg-apple-primary text-white hover:bg-apple-primary-focus rounded-full text-[18px] font-light px-7 py-3.5";
      break;
    case 'icon-circular':
      variantStyles = "bg-apple-surface-chip-translucent text-apple-ink rounded-full w-11 h-11 hover:opacity-85";
      break;
    case 'danger':
      variantStyles = "bg-red-600 text-white hover:bg-red-700 rounded-apple-sm text-[14px] px-4 py-2";
      break;
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
