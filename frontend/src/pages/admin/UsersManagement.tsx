import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  _count?: {
    enrollments?: number;
    courses?: number;
  };
  enrollments?: Array<{
    courseId: string;
    course: {
      id: string;
      title: string;
    };
  }>;
}

interface Course {
  id: string;
  title: string;
}

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: 'ALL',
    verified: 'ALL',
    courseId: 'ALL',
    sortBy: 'createdAt',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users?limit=100');
      const usersData = response.data.data;
      setUsers(usersData.users || usersData);
    } catch (error: any) {
      toast.error('Помилка завантаження користувачів');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses?limit=100');
      const coursesData = response.data.data;
      setCourses(coursesData.courses || coursesData);
    } catch (error: any) {
      console.error('Помилка завантаження курсів', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цього користувача?')) return;

    try {
      await api.delete(`/users/${userId}`);
      toast.success('Користувача видалено');
      fetchUsers();
    } catch (error) {
      toast.error('Помилка видалення');
    }
  };

  const filteredUsers = users
    .filter((user) => {
      const matchesRole = filters.role === 'ALL' || user.role === filters.role;
      const matchesVerified =
        filters.verified === 'ALL' ||
        (filters.verified === 'VERIFIED' && user.emailVerified) ||
        (filters.verified === 'UNVERIFIED' && !user.emailVerified);
      const matchesCourse =
        filters.courseId === 'ALL' ||
        (user.enrollments && user.enrollments.some(e => e.courseId === filters.courseId));
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRole && matchesVerified && matchesCourse && matchesSearch;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.firstName.localeCompare(b.firstName);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'role':
          return a.role.localeCompare(b.role);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">Адмін</span>;
      case 'TEACHER':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">Викладач</span>;
      case 'STUDENT':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">Студент</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">{role}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          <p className="mt-4 text-gray-400">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent mb-2">
            Користувачі
          </h1>
          <p className="text-gray-400">Всього: {filteredUsers.length} із {users.length}</p>
        </div>
        <Link
          to="/admin/users/create"
          className="btn bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/50 inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Додати користувача
        </Link>
      </div>

      {/* Filters */}
      <div className="glass p-6 rounded-2xl border border-gray-700 space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Пошук по імені, email..."
            className="input w-full pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          {/* Role Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ ...filters, role: 'ALL' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filters.role === 'ALL'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Всі ({users.length})
            </button>
            <button
              onClick={() => setFilters({ ...filters, role: 'ADMIN' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filters.role === 'ADMIN'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Адміни ({users.filter((u) => u.role === 'ADMIN').length})
            </button>
            <button
              onClick={() => setFilters({ ...filters, role: 'TEACHER' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filters.role === 'TEACHER'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Викладачі ({users.filter((u) => u.role === 'TEACHER').length})
            </button>
            <button
              onClick={() => setFilters({ ...filters, role: 'STUDENT' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filters.role === 'STUDENT'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Студенти ({users.filter((u) => u.role === 'STUDENT').length})
            </button>
          </div>

          <div className="w-px h-8 bg-gray-700"></div>

          {/* Verification Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ ...filters, verified: 'ALL' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filters.verified === 'ALL'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Всі
            </button>
            <button
              onClick={() => setFilters({ ...filters, verified: 'VERIFIED' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filters.verified === 'VERIFIED'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Верифіковані
            </button>
            <button
              onClick={() => setFilters({ ...filters, verified: 'UNVERIFIED' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filters.verified === 'UNVERIFIED'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Не верифіковані
            </button>
          </div>

          <div className="w-px h-8 bg-gray-700"></div>

          {/* Course Filter */}
          <select
            value={filters.courseId}
            onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
            className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-600 transition min-w-[200px]"
          >
            <option value="ALL">Всі курси</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

          <div className="w-px h-8 bg-gray-700"></div>

          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
          >
            <option value="createdAt">За датою реєстрації</option>
            <option value="name">За ім'ям</option>
            <option value="email">За email</option>
            <option value="role">За роллю</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center border border-gray-700">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-xl text-gray-400 mb-2">Користувачів не знайдено</p>
          <p className="text-gray-500">Спробуйте змінити фільтри</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Користувач
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Роль
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-24">
                    Курси
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Дата реєстрації
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Дії
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-green-400 text-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Верифіковано
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-yellow-400 text-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Не підтверджено
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.role === 'STUDENT' && user.enrollments && user.enrollments.length > 0 ? (
                        <div 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium cursor-help"
                          title={user.enrollments.map(e => e.course.title).join('\n')}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          {user.enrollments.length}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('uk-UA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/users/${user.id}/edit`}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition"
                          title="Редагувати"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                          title="Видалити"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
