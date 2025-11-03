import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import api from '../../services/api';
import toast from 'react-hot-toast';
import TeacherDashboard from '../teacher/TeacherDashboard';

interface Stats {
  enrollments: number;
  submissions: number;
  quizAttempts: number;
  averageGrade: number;
  completedAssignments: number;
  pendingAssignments: number;
}

interface Enrollment {
  id: string;
  progress: number;
  course: {
    id: string;
    title: string;
    thumbnail?: string;
    teacher: {
      firstName: string;
      lastName: string;
    };
  };
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string | null;
  maxScore: number;
  course: {
    id: string;
    title: string;
  };
  _count: {
    submissions: number;
  };
}

const DashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentCourses, setRecentCourses] = useState<Enrollment[]>([]);
  const [_upcomingAssignments, _setUpcomingAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Show teacher dashboard for teachers
  if (user?.role === 'TEACHER') {
    return <TeacherDashboard />;
  }

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      if (!user) return;

      const [statsRes, enrollmentsRes] = await Promise.all([
        api.get(`/users/${user.id}/stats`),
        api.get('/enrollments/my?limit=3'),
      ]);

      setStats(statsRes.data.data);
      setRecentCourses(enrollmentsRes.data.data);

      // Fetch upcoming assignments
      try {
        const assignmentsRes = await api.get('/assignments/my-upcoming?limit=5');
        _setUpcomingAssignments(assignmentsRes.data.data || []);
      } catch (err) {
        console.log('No upcoming assignments endpoint');
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Завантаження...</h1>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Вітаємо, {user?.firstName}!
        </h1>
        <p className="text-gray-400">Продовжуйте навчання та досягайте нових висот</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-purple-400">{stats?.enrollments || 0}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Активних курсів</h3>
          </div>
        </div>

        {/* Completed Assignments */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-green-400">{stats?.completedAssignments || 0}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Виконано завдань</h3>
          </div>
        </div>

        {/* Average Grade */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-yellow-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-yellow-400">
                {stats?.averageGrade ? stats.averageGrade.toFixed(1) : '—'}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Середня оцінка</h3>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Швидкі дії</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/dashboard/my-courses"
            className="relative group overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 opacity-90 group-hover:opacity-100 transition"></div>
            <div className="relative p-6 text-white">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Мої курси</h3>
              <p className="text-purple-100 text-sm">Продовжити навчання</p>
              <div className="mt-4 inline-flex items-center text-sm font-medium">
                Перейти <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          <Link
            to="/courses"
            className="relative group overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 opacity-90 group-hover:opacity-100 transition"></div>
            <div className="relative p-6 text-white">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Знайти курси</h3>
              <p className="text-blue-100 text-sm">Записатися на новий курс</p>
              <div className="mt-4 inline-flex items-center text-sm font-medium">
                Переглянути <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          <Link
            to="/dashboard/notifications"
            className="relative group overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600 opacity-90 group-hover:opacity-100 transition"></div>
            <div className="relative p-6 text-white">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Сповіщення</h3>
              <p className="text-orange-100 text-sm">Перевірити оновлення</p>
              <div className="mt-4 inline-flex items-center text-sm font-medium">
                Відкрити <span className="ml-2">→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* My Courses Progress */}
      {recentCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Мої курси</h2>
            <Link to="/dashboard/my-courses" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              Переглянути всі →
            </Link>
          </div>
          <div className="grid gap-4">
            {recentCourses.map((enrollment) => (
              <Link
                key={enrollment.id}
                to={`/courses/${enrollment.course.id}`}
                className="glass p-6 rounded-2xl border border-gray-700 hover:border-purple-500/50 transition group"
              >
                <div className="flex items-center gap-4">
                  {enrollment.course.thumbnail ? (
                    <img
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl flex items-center justify-center">
                      <svg className="w-10 h-10 text-purple-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white group-hover:text-purple-400 transition mb-1 truncate">
                      {enrollment.course.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {enrollment.course.teacher.firstName} {enrollment.course.teacher.lastName}
                    </p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Прогрес</span>
                        <span className="font-semibold text-purple-400">{enrollment.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-purple-400 opacity-0 group-hover:opacity-100 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recentCourses.length === 0 && (
        <div className="glass p-12 rounded-2xl text-center border border-gray-700">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">Ще немає курсів</h3>
          <p className="text-gray-400 mb-6">Почніть свою освітню подорож вже сьогодні!</p>
          <Link to="/courses" className="btn btn-primary inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Переглянути доступні курси
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
