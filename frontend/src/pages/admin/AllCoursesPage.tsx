import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  status: string;
  level: string;
  teacher: {
    firstName: string;
    lastName: string;
  };
  category?: {
    name: string;
    color: string;
  };
  _count: {
    enrollments: number;
    lessons: number;
  };
}

const AllCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses?limit=100');
      setCourses(response.data.data.courses || []);
    } catch (error: any) {
      toast.error('Помилка завантаження курсів');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей курс?')) return;

    try {
      await api.delete(`/courses/${courseId}`);
      toast.success('Курс видалено');
      fetchCourses();
    } catch (error) {
      toast.error('Помилка видалення');
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesFilter = filter === 'ALL' || course.status === filter;
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${course.teacher.firstName} ${course.teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          <p className="mt-4 text-gray-400">Завантаження курсів...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Керування курсами
          </h1>
          <p className="text-gray-400">Всього курсів: {filteredCourses.length}</p>
        </div>
        <Link
          to="/admin/courses/create"
          className="btn bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/50 inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Створити курс
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="glass p-6 rounded-2xl border border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Пошук курсів, викладачів..."
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
          </div>

          {/* Status Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'ALL'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Всі ({courses.length})
            </button>
            <button
              onClick={() => setFilter('PUBLISHED')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'PUBLISHED'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Активні ({courses.filter((c) => c.status === 'PUBLISHED').length})
            </button>
            <button
              onClick={() => setFilter('DRAFT')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'DRAFT'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Чернетки ({courses.filter((c) => c.status === 'DRAFT').length})
            </button>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center">
          <svg className="w-24 h-24 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-xl text-gray-400 mb-2">Курсів не знайдено</p>
          <p className="text-gray-500">Спробуйте змінити фільтри або створіть новий курс</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="glass rounded-2xl border border-gray-700 hover:border-purple-500/50 transition overflow-hidden group"
            >
              {/* Thumbnail */}
              {course.thumbnail ? (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                        course.status === 'PUBLISHED'
                          ? 'bg-green-500/80 text-white'
                          : course.status === 'DRAFT'
                          ? 'bg-yellow-500/80 text-white'
                          : 'bg-gray-500/80 text-white'
                      }`}
                    >
                      {course.status === 'PUBLISHED' ? 'Опубліковано' : course.status === 'DRAFT' ? 'Чернетка' : 'Архів'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative h-48 bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                  <svg className="w-20 h-20 text-purple-300/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                        course.status === 'PUBLISHED'
                          ? 'bg-green-500/80 text-white'
                          : course.status === 'DRAFT'
                          ? 'bg-yellow-500/80 text-white'
                          : 'bg-gray-500/80 text-white'
                      }`}
                    >
                      {course.status === 'PUBLISHED' ? 'Опубліковано' : course.status === 'DRAFT' ? 'Чернетка' : 'Архів'}
                    </span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Category */}
                {course.category && (
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: course.category.color + '20',
                      color: course.category.color,
                      borderColor: course.category.color + '40',
                      borderWidth: '1px',
                    }}
                  >
                    {course.category.name}
                  </span>
                )}

                {/* Title */}
                <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:text-purple-400 transition">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm line-clamp-2">{course.description}</p>

                {/* Teacher */}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {course.teacher.firstName} {course.teacher.lastName}
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1 text-purple-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {course._count.lessons} уроків
                  </div>
                  <div className="flex items-center gap-1 text-blue-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {course._count.enrollments} студентів
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-700">
                  <Link
                    to={`/courses/${course.id}`}
                    className="flex-1 btn btn-sm bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Переглянути
                  </Link>
                  <Link
                    to={`/admin/courses/${course.id}/edit`}
                    className="flex-1 btn btn-sm bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Редагувати
                  </Link>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/courses/${course.id}/students`}
                    className="flex-1 btn btn-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Студенти ({course._count.enrollments})
                  </Link>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="btn btn-sm bg-red-500 hover:bg-red-600 text-white px-4"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllCoursesPage;
