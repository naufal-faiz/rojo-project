"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import { CloseLineIcon } from "@/icons/index";

export interface SearchOption {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
interface SearchableSelectProps {
  /** Pencarian server, maksimal sepuluh hasil. */
  search: (query: string) => Promise<SearchOption[]>;
  mode?: "single" | "multi";
  value: SearchOption | SearchOption[] | null;
  onChange: (value: SearchOption | SearchOption[] | null) => void;
  placeholder?: string;
  disabled?: boolean;
  renderOption?: (option: SearchOption) => React.ReactNode;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ search, mode = "single", value, onChange, placeholder = "Cari dan pilih...", disabled, renderOption }) => {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const options = await search(query);
        if (!cancelled) { setResults(options.slice(0, 10)); setActive(-1); }
      } catch {
        if (!cancelled) { setResults([]); setError("Pencarian gagal. Coba ketik kembali."); }
      } finally { if (!cancelled) setLoading(false); }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, open, search]);
  const choose = (option: SearchOption) => {
    if (option.disabled) return;
    if (mode === "multi") {
      onChange(selected.some((item) => item.id === option.id) ? selected.filter((item) => item.id !== option.id) : [...selected, option]);
    } else { onChange(option); setOpen(false); setQuery(""); }
    input.current?.focus();
  };
  const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") { setOpen(false); return; }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault(); setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      let next = active;
      for (let i = 0; i < results.length; i++) {
        next = (next + step + results.length) % results.length;
        if (!results[next].disabled) { setActive(next); break; }
      }
    }
    if (event.key === "Enter" && open) {
      event.preventDefault();
      if (!loading && active >= 0 && results[active]) choose(results[active]);
    }
  };
  return (
    <div className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      {selected.length > 0 && <div className="mb-2 flex flex-wrap gap-2">{selected.map((item) => (
        <span key={item.id} className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {item.label}<button type="button" disabled={disabled} title={`Hapus pilihan ${item.label}`} aria-label={`Hapus pilihan ${item.label}`}
            onClick={() => onChange(mode === "multi" ? selected.filter((current) => current.id !== item.id) : null)}><CloseLineIcon className="size-4" /></button>
        </span>
      ))}</div>}
      <input ref={input} role="combobox" aria-label={placeholder} aria-expanded={open} aria-controls={`${id}-list`}
        aria-autocomplete="list" aria-activedescendant={open && active >= 0 ? `${id}-${active}` : undefined}
        value={query} disabled={disabled} placeholder={placeholder} onFocus={() => setOpen(true)} onKeyDown={handleKey}
        onChange={(event) => { setQuery(event.target.value); setLoading(true); setActive(-1); setOpen(true); }}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
      {open && <div className="absolute z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900">
        <div role="status" className="h-5 text-xs text-gray-500 dark:text-gray-400">{loading ? "Mencari..." : error || (results.length === 10 ? "Menampilkan 10 teratas, ketik untuk mempersempit" : `${results.length} hasil`)}</div>
        <ul id={`${id}-list`} role="listbox" aria-multiselectable={mode === "multi"} aria-busy={loading} className="h-60 overflow-y-auto">
          {!loading && !results.length && <li className="p-3 text-sm text-gray-500 dark:text-gray-400">Tidak ada hasil.</li>}
          {results.map((option, index) => <li key={option.id} id={`${id}-${index}`} role="option" aria-selected={selected.some((item) => item.id === option.id)} aria-disabled={option.disabled || loading}>
            <button type="button" disabled={option.disabled || loading} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)}
              className={`w-full rounded px-3 py-2 text-left text-sm text-gray-800 disabled:opacity-50 dark:text-gray-200 ${active === index ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
              {mode === "multi" && <span aria-hidden="true" className="mr-2">{selected.some((item) => item.id === option.id) ? "☑" : "☐"}</span>}
              {renderOption ? renderOption(option) : <><span>{option.label}</span>{option.description && <span className="block text-xs text-gray-500 dark:text-gray-400">{option.description}</span>}</>}
            </button>
          </li>)}
        </ul>
      </div>}
    </div>
  );
};
export default SearchableSelect;
