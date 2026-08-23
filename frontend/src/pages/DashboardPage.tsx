import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { SearchBar, SearchFilters } from '../components/SearchBar';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleForm } from '../components/VehicleForm';
import { Vehicle } from '../types';

export function DashboardPage() {
  const { token, user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  const loadVehicles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.listVehicles(token);
      setVehicles(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  async function handleSearch(filters: SearchFilters) {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (filters.make) params.make = filters.make;
      if (filters.model) params.model = filters.model;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      const data = await api.searchVehicles(token, params);
      setVehicles(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(id: number) {
    if (!token) return;
    try {
      const updated = await api.purchaseVehicle(token, id);
      setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Purchase failed');
    }
  }

  async function handleRestock(id: number) {
    if (!token) return;
    const amountStr = window.prompt('How many units to add?', '1');
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (!Number.isInteger(amount) || amount <= 0) {
      setError('Restock amount must be a positive whole number');
      return;
    }
    try {
      const updated = await api.restockVehicle(token, id, amount);
      setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Restock failed');
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    if (!window.confirm('Delete this vehicle from inventory?')) return;
    try {
      await api.deleteVehicle(token, id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed');
    }
  }

  async function handleFormSubmit(vehicle: Omit<Vehicle, 'id'>) {
    if (!token) return;
    if (editing) {
      const updated = await api.updateVehicle(token, editing.id, vehicle);
      setVehicles((prev) => prev.map((v) => (v.id === editing.id ? updated : v)));
    } else {
      const created = await api.createVehicle(token, vehicle);
      setVehicles((prev) => [...prev, created]);
    }
    setShowForm(false);
    setEditing(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Vehicle Inventory</h1>
            <p className="text-sm text-slate-500">{vehicles.length} vehicles listed</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              + Add vehicle
            </button>
          )}
        </div>

        <div className="mb-6">
          <SearchBar onSearch={handleSearch} onReset={loadVehicles} />
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-slate-500">Loading vehicles…</p>
        ) : vehicles.length === 0 ? (
          <p className="text-slate-500">No vehicles found. Try adjusting your search.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isAdmin={isAdmin}
                onPurchase={handlePurchase}
                onEdit={(v) => {
                  setEditing(v);
                  setShowForm(true);
                }}
                onDelete={handleDelete}
                onRestock={handleRestock}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <VehicleForm
          initial={editing}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
