import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyInputProps {
  label: string;
  value: string;
  readOnly?: boolean;
  placeholder?: string;
}

export const CopyInput: React.FC<CopyInputProps> = ({ label, value, readOnly = true, placeholder }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{label}</span>
      <div className="relative group">
        <input
          type="text"
          readOnly={readOnly}
          value={value}
          placeholder={placeholder}
          className={`w-full bg-slate-900 border ${
            copied ? 'border-emerald-500' : 'border-slate-700'
          } text-emerald-100 text-sm rounded-md p-2.5 pr-10 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono transition-all`}
        />
        <button
          onClick={handleCopy}
          disabled={!value}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
};
