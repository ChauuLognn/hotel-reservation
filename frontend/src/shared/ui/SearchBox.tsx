import { Search } from 'lucide-react';

interface SearchBoxProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBox({ value, onChange, placeholder = 'Tìm kiếm...', className = '' }: SearchBoxProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search size={16} className="absolute left-4 text-apple-ink-muted-48 pointer-events-none" />
      <input
        className="w-full bg-apple-canvas text-apple-ink text-[15px] hairline-border rounded-full pl-10 pr-4 py-2 h-11 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
