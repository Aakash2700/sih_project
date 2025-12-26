import { Routes, Route, NavLink, useLocation, Link } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import AlertsPage from './pages/AlertsPage';
import MapViewPage from './pages/MapViewPage';
import SensorDetailPage from './pages/SensorDetailPage';
import SettingsPage from './pages/SettingsPage';
import HealthReportsPage from './pages/HealthReportsPage';
import PredictionPage from './pages/PredictionPage';

const Layout = () => {
  const location = useLocation();
  const getHeaderTitle = (pathname: string) => {
    if (pathname === '/dashboard' || pathname === '/dashboard/') return 'Dashboard Overview';
    if (pathname.startsWith('/dashboard/alerts')) return 'Alerts';
    if (pathname.startsWith('/dashboard/map-view')) return 'Map View';
    if (pathname.startsWith('/dashboard/ml')) return 'ML Prediction';
    if (pathname.startsWith('/dashboard/settings')) return 'Settings';
    if (pathname.startsWith('/dashboard/sensors/')) return 'Sensor Details';
    return 'Dashboard';
  };
  const headerTitle = getHeaderTitle(location.pathname);

  return (
    <div className="flex h-screen bg-secondary">
      {/* Sidebar */}
      <div className="w-64 hero-gradient-soft text-white p-5 flex flex-col shadow-hero">
        <h1 className="text-2xl font-bold">Health Dashboard</h1>
        <nav className="mt-6 space-y-1">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'block py-2.5 px-4 rounded bg-white/15 text-white hover:brightness-110' : 'block py-2.5 px-4 rounded hover:bg-white/10'}>Dashboard</NavLink>
          <NavLink to="/dashboard/alerts" className={({ isActive }) => isActive ? 'block py-2.5 px-4 rounded bg-white/15 text-white hover:brightness-110' : 'block py-2.5 px-4 rounded hover:bg-white/10'}>Alerts</NavLink>
          <NavLink to="/dashboard/map-view" className={({ isActive }) => isActive ? 'block py-2.5 px-4 rounded bg-white/15 text-white hover:brightness-110' : 'block py-2.5 px-4 rounded hover:bg-white/10'}>Map View</NavLink>
          <NavLink to="/dashboard/health-reports" className={({ isActive }) => isActive ? 'block py-2.5 px-4 rounded bg-white/15 text-white hover:brightness-110' : 'block py-2.5 px-4 rounded hover:bg-white/10'}>Health Reports</NavLink>
          <NavLink to="/dashboard/ml" className={({ isActive }) => isActive ? 'block py-2.5 px-4 rounded bg-white/15 text-white hover:brightness-110' : 'block py-2.5 px-4 rounded hover:bg-white/10'}>ML Predict</NavLink>
          <NavLink to="/dashboard/settings" className={({ isActive }) => isActive ? 'block py-2.5 px-4 rounded bg-white/15 text-white hover:brightness-110' : 'block py-2.5 px-4 rounded hover:bg-white/10'}>Settings</NavLink>
        </nav>
      </div>
      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="hero-gradient-soft text-white p-4 shadow-hero flex items-center justify-between">
          <h2 className="text-xl font-semibold drop-shadow">{headerTitle}</h2>
          <Link to="/" className="px-3 py-1.5 text-sm rounded-md border border-white/30 bg-white/20 text-white hover:bg-white/25 shadow-button">Back to home</Link>
        </header>
        <main className="flex flex-col flex-1 p-6 overflow-y-auto hero-gradient-soft">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/map-view" element={<MapViewPage />} />
            <Route path="/health-reports" element={<HealthReportsPage />} />
            <Route path="/sensors/:sensorId" element={<SensorDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/ml/:sensorId" element={<PredictionPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Layout;


