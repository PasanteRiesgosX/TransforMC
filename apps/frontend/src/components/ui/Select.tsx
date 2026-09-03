import { forwardRef, type SelectHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, options, className = '', ...props }, ref) => {
    return (
      <div className={`field ${error ? 'field-error' : ''} ${className}`.trim()}>
        {label && <label>{label}</label>}
        <select ref={ref} {...props}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';
