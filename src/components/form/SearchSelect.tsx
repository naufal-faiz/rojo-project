"use client";
import { useId, useState } from "react";

type Option = { value: string; label: string; description?: string };

export default function SearchSelect({ options, value, onChange, placeholder, allowCustom = false }: {
  options: Option[]; value: string; onChange: (value: string) => void; placeholder: string; allowCustom?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const filtered = options.filter((o) => `${o.label} ${o.description ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  const choose = (option: Option) => { onChange(option.value); setOpen(false); setQuery(""); setActive(-1); };
  return (
    <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <input role="combobox" aria-label={placeholder} aria-expanded={open} aria-controls={id} aria-autocomplete="list" aria-activedescendant={open && active >= 0 ? `${id}-${active}` : undefined}
        value={open ? query : options.find((o) => o.value === value)?.label ?? value} placeholder={placeholder}
        onFocus={() => { setOpen(true); setQuery(""); setActive(-1); }}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(-1); onChange(allowCustom ? e.target.value : ""); }}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); }
          if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, filtered.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
          if (e.key === "Enter" && open && filtered[active]) { e.preventDefault(); choose(filtered[active]); }
        }}
        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm leading-5 text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
      {open && <ul id={id} role="listbox" className="absolute z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
        {filtered.map((o, i) => <li key={o.value} id={`${id}-${i}`} role="option" aria-selected={o.value === value}>
          <button type="button" tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(o)} className={`w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50 dark:text-white/90 dark:hover:bg-white/5 ${active === i ? "bg-gray-100 dark:bg-gray-800" : ""}`}>
            <span className="block">{o.label}</span>{o.description && <span className="block text-xs text-gray-500 dark:text-gray-400">{o.description}</span>}
          </button>
        </li>)}
        {!filtered.length && <li className="px-3 py-2 text-xs text-gray-500">{allowCustom ? "Perusahaan baru akan disimpan bersama peserta." : "Pelatihan tidak ditemukan."}</li>}
      </ul>}
    </div>
  );
}
