import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-brand-700 text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <span className="text-xl font-bold tracking-tight">🚗 AutoLot</span>
        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:inline">
              {user.email} <span className="rounded bg-brand-500 px-2 py-0.5 text-xs uppercase">{user.role}</span>
            </span>
            <button
              onClick={handleLogout}
              className="rounded-md bg-white/10 px-3 py-1.5 font-medium transition hover:bg-white/20"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
