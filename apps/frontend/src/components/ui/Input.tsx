import { forwardRef, type InputHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = '', ...props }, ref) => {
    return (
      <div className={`field ${error ? 'field-error' : ''} ${className}`.trim()}>
        {label && <label>{label}</label>}
        <input ref={ref} {...props} />
        {error && (
          <div className="error-msg slide-up">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
        {hint && !error && <div className="hint">{hint}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';
