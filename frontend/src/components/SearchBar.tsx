import { FormEvent, useState } from 'react';

export interface SearchFilters {
  make: string;
  model: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}

interface Props {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

const EMPTY: SearchFilters = { make: '', model: '', category: '', minPrice: '', maxPrice: '' };

export function SearchBar({ onSearch, onReset }: Props) {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch(filters);
  }

  function handleReset() {
    setFilters(EMPTY);
    onReset();
  }

  function update(key: keyof SearchFilters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3 md:grid-cols-6"
    >
      <input
        placeholder="Make"
        value={filters.make}
        onChange={(e) => update('make', e.target.value)}
        className="col-span-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />
      <input
        placeholder="Model"
        value={filters.model}
        onChange={(e) => update('model', e.target.value)}
        className="col-span-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />
      <input
        placeholder="Category"
        value={filters.category}
        onChange={(e) => update('category', e.target.value)}
        className="col-span-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />
      <input
        placeholder="Min price"
        type="number"
        value={filters.minPrice}
        onChange={(e) => update('minPrice', e.target.value)}
        className="col-span-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />
      <input
        placeholder="Max price"
        type="number"
        value={filters.maxPrice}
        onChange={(e) => update('maxPrice', e.target.value)}
        className="col-span-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />
      <div className="col-span-2 flex gap-2 sm:col-span-1">
        <button
          type="submit"
          className="flex-1 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
