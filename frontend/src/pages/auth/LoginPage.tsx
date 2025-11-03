import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/redux';
import { setUser, setTokens } from '../../store/slices/authSlice';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';
import Logo from '../../components/Logo';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      
      dispatch(setUser(response.data.user));
      dispatch(setTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      }));

      toast.success('Успішний вхід!');
      
      // Redirect based on role
      const role = response.data.user.role;
      if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'TEACHER') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Помилка входу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h2 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Вхід в систему
            </span>
          </h2>
          <p className="text-lg text-gray-400">
            Введіть свої дані для входу
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl space-y-6 shadow-lg">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-100">
              Email
            </label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-100">
              Пароль
            </label>
            <input
              type="password"
              className="input"
              placeholder="Введіть пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full py-3 text-lg" disabled={loading}>
            {loading ? 'Вхід...' : 'Увійти'}
          </button>

          <p className="text-center text-sm text-gray-300">
            Немає акаунту?{' '}
            <Link to="/register" className="text-purple-400 hover:underline font-semibold">
              Зареєструватись
            </Link>
          </p>
        </form>

        <div className="mt-8 glass p-6 rounded-xl shadow-md">
          <p className="text-sm font-semibold mb-3 text-gray-100">
            Тестові акаунти:
          </p>
          <div className="space-y-2 text-sm text-gray-300 font-mono">
            <div className="bg-gray-800 p-2 rounded">
              <p className="font-semibold text-xs text-gray-400 mb-1">ADMIN</p>
              <p>admin@vitaedu.com / password123</p>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <p className="font-semibold text-xs text-gray-400 mb-1">TEACHER</p>
              <p>dmytro.koval@vitaedu.com / password123</p>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <p className="font-semibold text-xs text-gray-400 mb-1">STUDENT</p>
              <p>denys.lysenko@student.vitaedu.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;





