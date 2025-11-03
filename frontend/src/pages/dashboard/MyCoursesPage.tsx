import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Enrollment {
  id: string;
  progress: number;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
    teacher: {
      firstName: string;
      lastName: string;
    };
    category?: {
      name: string;
    };
    _count: {
      lessons: number;
      assignments: number;
    };
  };
  // Additional stats
  completedLessons?: number;
  completedAssignments?: number;
  averageGrade?: number;
}

const MyCoursesPage = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    fetchMyEnrollments();
  }, []);

  const fetchMyEnrollments = async () => {
    try {
      const response = await api.get('/enrollments/my');
      setEnrollments(response.data.data);
    } catch (error: any) {
      toast.error('Помилка завантаження курсів');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    if (filter === 'all') return true;
    if (filter === 'active') return enrollment.progress < 100;
    if (filter === 'completed') return enrollment.progress === 100;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          Мої курси
        </h1>
        <div className="text-center text-gray-400">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Мої курси
        </h1>
        <p className="text-gray-400">Ваші навчальні програми та прогрес</p>
      </div>

      {/* Stats Overview */}
      {enrollments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-2xl border border-purple-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{enrollments.length}</p>
                <p className="text-sm text-gray-400">Всього курсів</p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-blue-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {enrollments.filter(e => e.progress < 100).length}
                </p>
                <p className="text-sm text-gray-400">В процесі</p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-green-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {enrollments.filter(e => e.progress === 100).length}
                </p>
                <p className="text-sm text-gray-400">Завершено</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {enrollments.length > 0 && (
        <div className="flex gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-xl font-medium transition ${
              filter === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'glass text-gray-400 hover:text-white'
            }`}
          >
            Всі ({enrollments.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-6 py-2 rounded-xl font-medium transition ${
              filter === 'active'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                : 'glass text-gray-400 hover:text-white'
            }`}
          >
            В процесі ({enrollments.filter(e => e.progress < 100).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-2 rounded-xl font-medium transition ${
              filter === 'completed'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                : 'glass text-gray-400 hover:text-white'
            }`}
          >
            Завершені ({enrollments.filter(e => e.progress === 100).length})
          </button>
        </div>
      )}
      
      {/* Courses Grid */}
      {filteredEnrollments.length === 0 && enrollments.length > 0 ? (
        <div className="glass p-12 rounded-2xl text-center border border-gray-700">
          <p className="text-gray-400">Немає курсів у цій категорії</p>
        </div>
      ) : filteredEnrollments.length === 0 ? (
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
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredEnrollments.map((enrollment) => (
            <div key={enrollment.id} className="glass rounded-2xl border border-gray-700 hover:border-purple-500/50 transition overflow-hidden group">
              {/* Thumbnail */}
              {enrollment.course.thumbnail ? (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={enrollment.course.thumbnail}
                    alt={enrollment.course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                  {enrollment.course.category && (
                    <span className="absolute top-4 left-4 badge badge-primary">
                      {enrollment.course.category.name}
                    </span>
                  )}
                  {enrollment.progress === 100 && (
                    <div className="absolute top-4 right-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Завершено
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center">
                  <svg className="w-20 h-20 text-purple-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-400 transition">
                  {enrollment.course.title}
                </h3>
                <p className="text-gray-400 mb-4 line-clamp-2 text-sm">
                  {enrollment.course.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {enrollment.course.teacher.firstName} {enrollment.course.teacher.lastName}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {enrollment.course._count.lessons} уроків
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {enrollment.course._count.assignments} завдань
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Прогрес курсу</span>
                    <span className="font-semibold text-purple-400">{enrollment.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to={`/courses/${enrollment.course.id}`}
                    className="btn btn-primary flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Уроки
                  </Link>
                  <Link
                    to={`/dashboard/courses/${enrollment.course.id}/assignments`}
                    className="btn bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Завдання
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
