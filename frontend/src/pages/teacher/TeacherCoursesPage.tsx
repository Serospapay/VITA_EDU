import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
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
  category?: {
    name: string;
    color: string;
  };
  _count: {
    enrollments: number;
    lessons: number;
    assignments: number;
  };
  enrollments?: Array<{
    progress: number;
    completedAt: string | null;
  }>;
}

const TeacherCoursesPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyCourses();
    }
  }, [user]);

  const fetchMyCourses = async () => {
    try {
      const response = await api.get(`/courses/teacher/${user?.id}`);
      setCourses(response.data.data);
    } catch (error: any) {
      toast.error('Помилка завантаження курсів');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Reserved for future delete functionality
  // const _handleDelete = async (courseId: string) => {
  //   if (!confirm('Ви впевнені, що хочете видалити цей курс?')) {
  //     return;
  //   }
  //   try {
  //     await api.delete(`/courses/${courseId}`);
  //     toast.success('Курс видалено');
  //     fetchMyCourses();
  //   } catch (error: any) {
  //     toast.error('Помилка видалення курсу');
  //   }
  // };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Мої курси</h1>
        <div className="text-center text-gray-400">Завантаження...</div>
      </div>
    );
  }

  // Calculate statistics
  const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
  const totalLessons = courses.reduce((sum, c) => sum + c._count.lessons, 0);
  // const _totalAssignments = courses.reduce((sum, c) => sum + c._count.assignments, 0);
  
  const avgProgress = courses.reduce((sum, course) => {
    if (!course.enrollments || course.enrollments.length === 0) return sum;
    const courseAvg = course.enrollments.reduce((s, e) => s + e.progress, 0) / course.enrollments.length;
    return sum + courseAvg;
  }, 0) / (courses.length || 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Мої курси
        </h1>
        <p className="text-gray-400">Керуйте вашими курсами та слідкуйте за успішністю студентів</p>
      </div>

      {/* Quick Stats */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Courses */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
            <div className="relative glass p-6 rounded-2xl border border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-purple-400">{courses.length}</span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Ваших курсів</h3>
            </div>
          </div>

          {/* Students */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
            <div className="relative glass p-6 rounded-2xl border border-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-blue-400">{totalStudents}</span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Студентів</h3>
            </div>
          </div>

          {/* Lessons */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
            <div className="relative glass p-6 rounded-2xl border border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-green-400">{totalLessons}</span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Уроків створено</h3>
            </div>
          </div>

          {/* Average Progress */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
            <div className="relative glass p-6 rounded-2xl border border-orange-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-orange-400">{avgProgress.toFixed(0)}%</span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Середній прогрес</h3>
            </div>
          </div>
        </div>
      )}

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center border border-gray-700">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">Курсів ще немає</h3>
          <p className="text-gray-400">Зверніться до адміністратора для призначення курсів</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const courseAvg = course.enrollments && course.enrollments.length > 0
              ? course.enrollments.reduce((s, e) => s + e.progress, 0) / course.enrollments.length
              : 0;

            return (
              <div key={course.id} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative glass p-6 rounded-2xl border border-gray-700 hover:border-purple-500/50 transition">
                  {/* Thumbnail or Placeholder */}
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-40 object-cover rounded-xl mb-4"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl mb-4 flex items-center justify-center">
                      <svg className="w-16 h-16 text-purple-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-3">
                    {course.category && (
                      <span
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ backgroundColor: course.category.color }}
                      >
                        {course.category.name}
                      </span>
                    )}
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        course.status === 'PUBLISHED'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : course.status === 'DRAFT'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}
                    >
                      {course.status === 'PUBLISHED'
                        ? '● Опубліковано'
                        : course.status === 'DRAFT'
                        ? '● Чернетка'
                        : course.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold mb-2 text-white line-clamp-1">{course.title}</h3>
                  <p className="text-gray-400 mb-4 text-sm line-clamp-2">{course.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-700">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-lg font-bold">{course._count.lessons}</span>
                      </div>
                      <p className="text-xs text-gray-500">Уроків</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-lg font-bold">{course._count.enrollments}</span>
                      </div>
                      <p className="text-xs text-gray-500">Студ.</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-lg font-bold">{courseAvg.toFixed(0)}%</span>
                      </div>
                      <p className="text-xs text-gray-500">Прогрес</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/teacher/courses/${course.id}/edit`}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Керувати
                    </Link>
                    <Link
                      to={`/teacher/courses/${course.id}/students`}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-xl font-medium transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Студенти
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherCoursesPage;

