import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Font Awesome class shown before the label, e.g. `fa-envelope`. */
  icon?: string;
}

type InputProps = FieldProps & InputHTMLAttributes<HTMLInputElement>;

/**
 * Text input with its label, hint and error wired together.
 *
 * `forwardRef` is required so React Hook Form's `register()` can attach its
 * ref. `aria-describedby` and `aria-invalid` mean the error is announced
 * rather than only shown in red.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, required, icon, className = '', id, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className={`field ${error ? 'field--invalid' : ''} ${className}`}>
      <label className="field__label" htmlFor={inputId}>
        {/* Decorative: the label text already names the field. */}
        {icon && <i className={`fas ${icon} field__icon`} aria-hidden="true" />}
        {label}
        {required && (
          <span className="field__required" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <input
        ref={ref}
        id={inputId}
        className="field__control"
        aria-invalid={Boolean(error)}
        aria-describedby={[error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined}
        {...rest}
      />

      {hint && !error && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}

      {error && (
        <p className="field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

type SelectProps = FieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: Array<{ value: string | number; label: string }>;
    placeholder?: string;
  };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, required, icon, options, placeholder, className = '', id, ...rest },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div className={`field ${error ? 'field--invalid' : ''} ${className}`}>
      <label className="field__label" htmlFor={selectId}>
        {icon && <i className={`fas ${icon} field__icon`} aria-hidden="true" />}
        {label}
        {required && (
          <span className="field__required" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <select
        ref={ref}
        id={selectId}
        className="field__control"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {hint && !error && <p className="field__hint">{hint}</p>}
      {error && (
        <p className="field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

type TextareaProps = FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, required, icon, className = '', id, rows = 4, ...rest },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;

  return (
    <div className={`field ${error ? 'field--invalid' : ''} ${className}`}>
      <label className="field__label" htmlFor={fieldId}>
        {icon && <i className={`fas ${icon} field__icon`} aria-hidden="true" />}
        {label}
        {required && (
          <span className="field__required" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        className="field__control"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />

      {hint && !error && <p className="field__hint">{hint}</p>}
      {error && (
        <p className="field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
