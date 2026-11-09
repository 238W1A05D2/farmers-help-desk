import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors hover:text-green-200 pb-0.5 ${
        location.pathname === to
          ? 'text-green-200 border-b-2 border-green-400'
          : 'text-white/80'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-green-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-white hover:text-green-200 transition-colors"
        >
          <span className="text-2xl">🌱</span>
          <div>
            <div className="font-bold text-base leading-tight">Smart Soil Salinity</div>
            <div className="text-xs text-green-400 leading-tight">Andhra Pradesh — Bapatla · Godavari</div>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          {navLink('/', 'Home')}
          {navLink('/check', 'Check Salinity')}
          {navLink('/about', 'About')}
        </div>
      </div>
    </nav>
  );
}
