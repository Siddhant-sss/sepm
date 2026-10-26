import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TacticalInput: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-[#B7AA83] mb-1.5 font-mono"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-md border bg-[#151A17] px-3 py-2 text-sm text-[#E8EBDD] placeholder-[#747653] transition-colors focus:outline-none focus:ring-1 ${
          error
            ? 'border-[#FF6464] focus:ring-[#FF6464]'
            : 'border-[#465044] focus:border-[#747653] focus:ring-[#B7AA83]'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[#FF6464]">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-[#A9B39F]">{helperText}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
}

export const TacticalSelect: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  children,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-[#B7AA83] mb-1.5 font-mono"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-md border bg-[#151A17] px-3 py-2 text-sm text-[#E8EBDD] transition-colors focus:outline-none focus:ring-1 ${
          error
            ? 'border-[#FF6464] focus:ring-[#FF6464]'
            : 'border-[#465044] focus:border-[#747653] focus:ring-[#B7AA83]'
        } ${className}`}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#202821] text-[#E8EBDD]">
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && <p className="mt-1 text-xs text-[#FF6464]">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-[#A9B39F]">{helperText}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TacticalTextarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 3,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold uppercase tracking-wider text-[#B7AA83] mb-1.5 font-mono"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full rounded-md border bg-[#151A17] px-3 py-2 text-sm text-[#E8EBDD] placeholder-[#747653] transition-colors focus:outline-none focus:ring-1 ${
          error
            ? 'border-[#FF6464] focus:ring-[#FF6464]'
            : 'border-[#465044] focus:border-[#747653] focus:ring-[#B7AA83]'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[#FF6464]">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-[#A9B39F]">{helperText}</p>}
    </div>
  );
};
