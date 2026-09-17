import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'link' | 'auth';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner and disables the button, to prevent double submits. */
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leadingIcon,
  className = '',
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--block' : '',
    loading ? 'btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      // Tells assistive technology the control is busy, not just disabled.
      aria-busy={loading}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : leadingIcon}
      <span>{children}</span>
    </button>
  );
}
