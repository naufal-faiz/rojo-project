"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterBarProps {
  /** Filter enum atau daftar kecil; data besar diteruskan melalui children. */
  filters: { key: string; label: string; options: { value: string; label: string }[] }[];
  children?: React.ReactNode;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const change = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {children}
      {filters.map((filter) => <label key={filter.key} className="text-sm text-gray-700 dark:text-gray-300">
        <span className="mb-1 block">{filter.label}</span>
        <select value={searchParams.get(filter.key) ?? ""} onChange={(event) => change(filter.key, event.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300">
          <option value="">Semua</option>
          {filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>)}
    </div>
  );
};
export default FilterBar;
