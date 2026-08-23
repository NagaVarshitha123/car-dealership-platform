import { FormEvent, useState } from 'react';
import { Vehicle } from '../types';

interface Props {
  initial?: Vehicle | null;
  onSubmit: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function VehicleForm({ initial, onSubmit, onCancel }: Props) {
  const [make, setMake] = useState(initial?.make ?? '');
  const [model, setModel] = useState(initial?.model ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [price, setPrice] = useState(String(initial?.price ?? ''));
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? ''));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        make,
        model,
        category,
        price: Number(price),
        quantity: Number(quantity),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          {initial ? 'Edit vehicle' : 'Add a new vehicle'}
        </h2>

        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Make"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            required
            placeholder="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            required
            placeholder="Category (Sedan, SUV, Truck...)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            required
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            required
            type="number"
            min="0"
            step="1"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
