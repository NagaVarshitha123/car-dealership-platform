import { Vehicle } from '../types';

interface Props {
  vehicle: Vehicle;
  isAdmin: boolean;
  onPurchase: (id: number) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => void;
  onRestock: (id: number) => void;
}

export function VehicleCard({ vehicle, isAdmin, onPurchase, onEdit, onDelete, onRestock }: Props) {
  const outOfStock = vehicle.quantity <= 0;
  const price = Number(vehicle.price).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div>
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            {vehicle.make} {vehicle.model}
          </h3>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
            {vehicle.category}
          </span>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900">{price}</p>
        <p className={`mt-1 text-sm ${outOfStock ? 'text-red-500' : 'text-slate-500'}`}>
          {outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          disabled={outOfStock}
          onClick={() => onPurchase(vehicle.id)}
          className="flex-1 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Purchase
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => onEdit(vehicle)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Edit
            </button>
            <button
              onClick={() => onRestock(vehicle.id)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Restock
            </button>
            <button
              onClick={() => onDelete(vehicle.id)}
              className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
