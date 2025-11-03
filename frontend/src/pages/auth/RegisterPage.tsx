import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Logo from '../../components/Logo';

interface Course {
  id: string;
  title: string;
}

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT' as 'STUDENT' | 'TEACHER',
    requestedCourseId: courseId || '',
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses?status=PUBLISHED');
      const coursesData = response.data.data;
      setCourses(coursesData.courses || coursesData || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.register(formData);
      toast.success(
        formData.requestedCourseId 
          ? 'Реєстрація успішна! Очікуйте підтвердження адміністратора для запису на курс.'
          : 'Реєстрація успішна! Очікуйте підтвердження адміністратора.',
        { duration: 5000 }
      );
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Помилка реєстрації');
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
              Реєстрація
            </span>
          </h2>
          <p className="text-lg text-gray-400">
            Створіть свій акаунт
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl space-y-5 shadow-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-100">
                Ім'я
              </label>
              <input
                type="text"
                className="input"
                placeholder="Іван"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-100">
                Прізвище
              </label>
              <input
                type="text"
                className="input"
                placeholder="Петренко"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-100">
              Email
            </label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
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
              placeholder="Мінімум 8 символів"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-100">
              Я...
            </label>
            <select
              className="input"
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as 'STUDENT' | 'TEACHER',
                })
              }
            >
              <option value="STUDENT">Студент</option>
              <option value="TEACHER">Викладач</option>
            </select>
          </div>

          {formData.role === 'STUDENT' && courses.length > 0 && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-100">
                Оберіть курс (опціонально)
              </label>
              <select
                className="input"
                value={formData.requestedCourseId}
                onChange={(e) =>
                  setFormData({ ...formData, requestedCourseId: e.target.value })
                }
              >
                <option value="">Без курсу</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {formData.requestedCourseId && (
                <p className="text-xs text-purple-400 mt-2">
                  ● Після підтвердження адміністратором ви будете автоматично записані на цей курс
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full py-3 text-lg"
            disabled={loading}
          >
            {loading ? 'Створення акаунту...' : 'Зареєструватись'}
          </button>

          <p className="text-center text-sm text-gray-300">
            Вже є акаунт?{' '}
            <Link to="/login" className="text-purple-400 hover:underline font-semibold">
              Увійти
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;




