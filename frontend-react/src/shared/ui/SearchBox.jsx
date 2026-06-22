import { Search } from 'lucide-react';

export default function SearchBox({ value, onChange, placeholder = 'Tìm kiếm...' }) {
  return (
    <div className="search-box">
      <Search size={16} className="search-icon" />
      <input
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
