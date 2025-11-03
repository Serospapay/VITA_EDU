import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  teachers: number;
  students: number;
  admins: number;
  publishedCourses: number;
  averageProgress: number;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    teachers: 0,
    students: 0,
    admins: 0,
    publishedCourses: 0,
    averageProgress: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, coursesRes] = await Promise.all([
        api.get('/users?limit=100'),
        api.get('/courses?limit=100'),
      ]);

      const usersData = usersRes.data.data;
      const users = usersData.users || usersData;
      const coursesData = coursesRes.data.data;
      const courses = coursesData.courses || coursesData;

      const publishedCount = courses.filter((c: any) => c.status === 'PUBLISHED').length;
      
      // Calculate average progress
      let totalProgress = 0;
      let enrollmentCount = 0;
      courses.forEach((c: any) => {
        if (c.enrollments && c.enrollments.length > 0) {
          c.enrollments.forEach((e: any) => {
            totalProgress += e.progress;
            enrollmentCount++;
          });
        }
      });
      const avgProgress = enrollmentCount > 0 ? totalProgress / enrollmentCount : 0;

      setStats({
        totalUsers: users.length,
        totalCourses: courses.length,
        totalEnrollments: courses.reduce(
          (sum: number, c: any) => sum + (c._count?.enrollments || 0),
          0
        ),
        teachers: users.filter((u: any) => u.role === 'TEACHER').length,
        students: users.filter((u: any) => u.role === 'STUDENT').length,
        admins: users.filter((u: any) => u.role === 'ADMIN').length,
        publishedCourses: publishedCount,
        averageProgress: avgProgress,
      });
    } catch (error: any) {
      toast.error('Помилка завантаження статистики');
      console.error(error);
    } finally {
      setLoading(false);
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Панель адміністратора
          </h1>
          <p className="text-gray-400">Керуйте платформою VITA-Edu</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/analytics"
            className="btn bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/50 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Аналітика
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-blue-400">{stats.totalUsers}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Всього користувачів</h3>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg">{stats.admins} адмінів</span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg">{stats.teachers} викладачів</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg">{stats.students} студентів</span>
            </div>
          </div>
        </div>

        {/* Active Courses */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-purple-400">{stats.publishedCourses}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Активних курсів</h3>
            <p className="mt-3 text-xs text-gray-500">
              {stats.totalCourses} всього | {stats.totalCourses - stats.publishedCourses} в розробці
            </p>
          </div>
        </div>

        {/* Total Enrollments */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-green-400">{stats.totalEnrollments}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Активних записів</h3>
            <p className="mt-3 text-xs text-gray-500">
              {stats.publishedCourses > 0 ? (stats.totalEnrollments / stats.publishedCourses).toFixed(1) : 0} студентів/курс
            </p>
          </div>
        </div>

        {/* Average Progress */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-orange-500/20 hover:border-orange-500/40 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-orange-400">{stats.averageProgress.toFixed(0)}%</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Середній прогрес</h3>
            <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all"
                style={{ width: `${stats.averageProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
          Швидкі дії
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/admin/users/create"
            className="relative group overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 opacity-90 group-hover:opacity-100 transition"></div>
            <div className="relative p-6 text-white">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Додати користувача</h3>
              <p className="text-blue-100 text-sm">Створити нового адміна, викладача або студента</p>
              <div className="mt-4 inline-flex items-center text-sm font-medium">
                Створити <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/courses/create"
            className="relative group overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 opacity-90 group-hover:opacity-100 transition"></div>
            <div className="relative p-6 text-white">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Новий курс</h3>
              <p className="text-purple-100 text-sm">Створити курс та призначити викладача</p>
              <div className="mt-4 inline-flex items-center text-sm font-medium">
                Створити <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="relative group overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-600 opacity-90 group-hover:opacity-100 transition"></div>
            <div className="relative p-6 text-white">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Аналітика</h3>
              <p className="text-green-100 text-sm">Детальна статистика та звіти</p>
              <div className="mt-4 inline-flex items-center text-sm font-medium">
                Переглянути <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/courses"
            className="relative group overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-yellow-600 opacity-90 group-hover:opacity-100 transition"></div>
            <div className="relative p-6 text-white">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Керувати курсами</h3>
              <p className="text-orange-100 text-sm">Редагувати та модерувати курси</p>
              <div className="mt-4 inline-flex items-center text-sm font-medium">
                Перейти <span className="ml-2">→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
          Управління
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/users"
            className="glass p-6 rounded-2xl border border-gray-700 hover:border-purple-500/50 transition group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-blue-400">{stats.totalUsers}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Користувачі</h3>
            <p className="text-gray-400 text-sm mb-4">Керування користувачами та ролями</p>
            <div className="flex items-center text-purple-400 text-sm font-medium group-hover:gap-2 transition-all">
              Відкрити <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link
            to="/admin/courses"
            className="glass p-6 rounded-2xl border border-gray-700 hover:border-purple-500/50 transition group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-purple-400">{stats.totalCourses}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Курси</h3>
            <p className="text-gray-400 text-sm mb-4">Модерація та редагування курсів</p>
            <div className="flex items-center text-purple-400 text-sm font-medium group-hover:gap-2 transition-all">
              Відкрити <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="glass p-6 rounded-2xl border border-gray-700 hover:border-purple-500/50 transition group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-green-400">{stats.averageProgress.toFixed(0)}%</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Звіти та Аналітика</h3>
            <p className="text-gray-400 text-sm mb-4">Статистика успішності та прогресу</p>
            <div className="flex items-center text-purple-400 text-sm font-medium group-hover:gap-2 transition-all">
              Відкрити <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
