import { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/redux';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      await api.put(`/users/${user.id}`, formData);
      toast.success('Профіль оновлено!');
      setEditing(false);
      // Reload page to get updated user data
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка оновлення профілю');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Мій профіль
        </h1>
        <p className="text-gray-400">Керування персональною інформацією</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-2xl border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Основна інформація</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Редагувати
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ім'я</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Прізвище</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Про себе</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition resize-none"
                    placeholder="Розкажіть про себе..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Телефон</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Дата народження</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      if (user) {
                        setFormData({
                          firstName: user.firstName || '',
                          lastName: user.lastName || '',
                          bio: user.bio || '',
                          phone: user.phone || '',
                          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                        });
                      }
                    }}
                    className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition disabled:opacity-50"
                  >
                    {saving ? 'Збереження...' : 'Зберегти'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Ім'я</label>
                    <p className="text-white font-medium">{user?.firstName || 'Не вказано'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Прізвище</label>
                    <p className="text-white font-medium">{user?.lastName || 'Не вказано'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <p className="text-white font-medium">{user?.email}</p>
                  {user?.emailVerified ? (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Підтверджено
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                      Не підтверджено
                    </span>
                  )}
                </div>

                {user?.bio && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Про себе</label>
                    <p className="text-white">{user.bio}</p>
                  </div>
                )}

                {user?.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Телефон</label>
                    <p className="text-white">{user.phone}</p>
                  </div>
                )}

                {user?.dateOfBirth && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Дата народження</label>
                    <p className="text-white">
                      {new Date(user.dateOfBirth).toLocaleDateString('uk-UA', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Роль</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    user?.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                    user?.role === 'TEACHER' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {user?.role === 'ADMIN' ? 'Адміністратор' :
                     user?.role === 'TEACHER' ? 'Викладач' :
                     'Студент'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="glass p-6 rounded-2xl border border-gray-700 text-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <h3 className="text-xl font-bold text-white mb-1">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>

          {/* Account Info */}
          <div className="glass p-6 rounded-2xl border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Інформація про акаунт</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Дата реєстрації</span>
                <span className="text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('uk-UA') : '—'}
                </span>
              </div>
              {user?.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Останнє оновлення</span>
                  <span className="text-white">
                    {new Date(user.updatedAt).toLocaleDateString('uk-UA')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
