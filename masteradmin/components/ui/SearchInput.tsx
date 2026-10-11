"use client";

import { Search, X } from "lucide-react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  className?: string;
};

export default function SearchInput({
  value,
  onChange,
  placeholder,
  label,
  className = "",
}: SearchInputProps) {
  return (
    <div className={`admin-search-field ${className}`}>
      <Search className="admin-search-icon" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="admin-input admin-search-input"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="admin-search-clear"
          aria-label={`Clear ${label.toLowerCase()}`}
          title={`Clear ${label.toLowerCase()}`}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}