import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const MainLayout = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Ви вийшли з системи');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass sticky top-0 z-50 border-b border-gray-700 bg-opacity-80 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" />

          <div className="flex items-center gap-6">
            <Link 
              to="/courses" 
              className="text-gray-300 hover:text-purple-400 font-semibold transition-colors"
            >
              Курси
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-purple-400 font-semibold transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300 font-semibold">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="badge badge-primary text-xs">{user?.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-red-400 font-semibold transition-colors"
                    title="Вийти"
                  >
                    Вийти
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-purple-400 font-semibold transition-colors"
                >
                  Вхід
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Реєстрація
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="glass border-t border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-400">
            © 2025 VITA-Edu. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;





