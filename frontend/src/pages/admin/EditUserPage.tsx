import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  bio?: string;
  emailVerified: boolean;
  requestedCourseId?: string;
  requestedCourse?: {
    id: string;
    title: string;
  };
}

const EditUserPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    bio: '',
  });

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      const userData = response.data.data;
      setUser(userData);
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        bio: userData.bio || '',
      });
    } catch (error: any) {
      toast.error('Помилка завантаження користувача');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/users/${id}`, formData);
      toast.success('Користувача оновлено!');
      navigate('/admin/users');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка оновлення');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!user) return;
    
    try {
      await api.patch(`/users/${id}/verify-email`);
      toast.success('Email користувача верифіковано!');
      fetchUser(); // Refresh user data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка верифікації');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center text-gray-400">Завантаження...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="glass p-8 rounded-2xl text-center">
          <p className="text-gray-400">Користувача не знайдено</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Редагувати користувача
        </h1>
        <button
          onClick={() => navigate('/admin/users')}
          className="btn bg-gray-700 hover:bg-gray-600 text-white"
        >
          ← Назад
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl space-y-6">
        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="input w-full opacity-60 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email не можна змінити</p>
        </div>

        {/* First Name & Last Name */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ім'я *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Прізвище *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Роль *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="input w-full"
          >
            <option value="STUDENT">Студент</option>
            <option value="TEACHER">Викладач</option>
            <option value="ADMIN">Адміністратор</option>
          </select>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Біографія
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="input w-full"
          />
        </div>

        {/* Requested Course */}
        {user.requestedCourseId && user.requestedCourse && (
          <div className="glass p-4 rounded-xl bg-blue-900/20 border border-blue-500/30">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-blue-300 block mb-1 font-medium">Обраний курс при реєстрації:</span>
                <p className="text-white text-lg">{user.requestedCourse.title}</p>
                <p className="text-sm text-gray-400 mt-1">
                  ● Після підтвердження email користувач буде автоматично записаний на цей курс
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Email Verification Status */}
        <div className="glass p-4 rounded-xl bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-300 block mb-1">Статус верифікації email:</span>
              {user.emailVerified ? (
                <span className="text-green-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Підтверджено
                </span>
              ) : (
                <span className="text-yellow-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Не підтверджено
                </span>
              )}
            </div>
            {!user.emailVerified && (
              <button
                type="button"
                onClick={handleVerifyEmail}
                className="btn bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2"
              >
                Підтвердити email
              </button>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary flex-1"
          >
            {saving ? 'Збереження...' : 'Зберегти зміни'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="btn bg-gray-700 hover:bg-gray-600 text-white flex-1"
          >
            Скасувати
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserPage;

