import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateUserPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT',
    bio: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      toast.success('Користувача створено!');
      navigate('/admin/users');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка створення користувача');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Створити користувача
        </h1>
        <button
          onClick={() => navigate('/admin/users')}
          className="btn bg-gray-700 hover:bg-gray-600 text-white"
        >
          ← Назад
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input w-full"
            placeholder="user@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Пароль *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className="input w-full"
            placeholder="Мінімум 6 символів"
          />
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
              placeholder="Іван"
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
              placeholder="Петренко"
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
          <p className="text-xs mt-1">
            {formData.role === 'ADMIN' && (
              <span className="text-red-400">● Адмін має повний доступ до системи</span>
            )}
            {formData.role === 'TEACHER' && (
              <span className="text-blue-400">● Може створювати та керувати курсами</span>
            )}
            {formData.role === 'STUDENT' && (
              <span className="text-green-400">● Може записуватись на курси та навчатись</span>
            )}
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Біографія (опціонально)
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="input w-full"
            placeholder="Розкажіть трохи про користувача..."
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? 'Створення...' : 'Створити користувача'}
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

export default CreateUserPage;

