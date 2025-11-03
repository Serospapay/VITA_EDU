import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  thumbnail?: string;
  _count: {
    enrollments: number;
    lessons: number;
  };
  enrollments?: Array<{
    progress: number;
    completedAt: string | null;
  }>;
}

interface TeacherStats {
  totalCourses: number;
  totalStudents: number;
  totalLessons: number;
  totalAssignments: number;
  pendingSubmissions: number;
  averageProgress: number;
}

const TeacherDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalLessons: 0,
    totalAssignments: 0,
    pendingSubmissions: 0,
    averageProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCourseSelector, setShowCourseSelector] = useState(false);
  const [selectorAction, setSelectorAction] = useState<'lesson' | 'assignment' | 'students'>('lesson');

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddLesson = () => {
    if (courses.length === 0) {
      toast.error('Немає доступних курсів');
      return;
    }
    if (courses.length === 1) {
      navigate(`/teacher/courses/${courses[0].id}/edit?tab=lessons`);
    } else {
      setSelectorAction('lesson');
      setShowCourseSelector(true);
    }
  };

  const handleViewStudents = () => {
    if (courses.length === 0) {
      toast.error('Немає доступних курсів');
      return;
    }
    if (courses.length === 1) {
      navigate(`/teacher/courses/${courses[0].id}/edit?tab=students`);
    } else {
      setSelectorAction('students');
      setShowCourseSelector(true);
    }
  };

  const handleCourseSelect = (courseId: string) => {
    setShowCourseSelector(false);
    if (selectorAction === 'lesson') {
      navigate(`/teacher/courses/${courseId}/edit?tab=lessons`);
    } else if (selectorAction === 'assignment') {
      navigate(`/teacher/courses/${courseId}/assignments/create`);
    } else {
      navigate(`/teacher/courses/${courseId}/edit?tab=students`);
    }
  };

  const handleCreateAssignment = () => {
    if (courses.length === 0) {
      toast.error('Немає доступних курсів');
      return;
    }
    if (courses.length === 1) {
      navigate(`/teacher/courses/${courses[0].id}/assignments/create`);
    } else {
      setSelectorAction('assignment');
      setShowCourseSelector(true);
    }
  };

  const fetchData = async () => {
    try {
      if (!user) return;

      const response = await api.get(`/courses/teacher/${user.id}`);
      const coursesData = response.data.data;
      setCourses(coursesData);

      // Calculate stats
      const totalCourses = coursesData.length;
      const totalStudents = coursesData.reduce((sum: number, c: Course) => sum + c._count.enrollments, 0);
      const totalLessons = coursesData.reduce((sum: number, c: Course) => sum + c._count.lessons, 0);
      
      const avgProgress = coursesData.reduce((sum: number, course: Course) => {
        if (!course.enrollments || course.enrollments.length === 0) return sum;
        const courseAvg = course.enrollments.reduce((s, e) => s + e.progress, 0) / course.enrollments.length;
        return sum + courseAvg;
      }, 0) / (coursesData.length || 1);

      // Fetch assignments and pending submissions
      let totalAssignments = 0;
      let pendingSubmissions = 0;

      for (const course of coursesData) {
        try {
          const assignmentsRes = await api.get(`/assignments/course/${course.id}`);
          const assignments = assignmentsRes.data.data || [];
          totalAssignments += assignments.length;

          // Fetch submissions for each assignment to count pending
          for (const assignment of assignments) {
            try {
              const submissionsRes = await api.get(`/submissions/assignment/${assignment.id}`);
              const submissions = submissionsRes.data.data || [];
              pendingSubmissions += submissions.filter((s: any) => s.status === 'PENDING').length;
            } catch (err) {
              // Silently ignore if endpoint doesn't exist yet
            }
          }
        } catch (err) {
          // Silently ignore if endpoint doesn't exist
        }
      }

      setStats({
        totalCourses,
        totalStudents,
        totalLessons,
        totalAssignments,
        pendingSubmissions,
        averageProgress: avgProgress,
      });
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

  // Get top 3 courses by student count
  const topCourses = [...courses]
    .sort((a, b) => b._count.enrollments - a._count.enrollments)
    .slice(0, 3);

  // Get courses that need attention (low avg progress)
  const needsAttention = courses.filter((course) => {
    if (!course.enrollments || course.enrollments.length === 0) return false;
    const avg = course.enrollments.reduce((s, e) => s + e.progress, 0) / course.enrollments.length;
    return avg < 50 && course._count.enrollments > 0;
  }).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Вітаємо, {user?.firstName}!
        </h1>
        <p className="text-gray-400">Огляд вашої викладацької діяльності</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-purple-400">{stats.totalCourses}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Ваших курсів</h3>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-blue-400">{stats.totalStudents}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Студентів</h3>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-green-400">{stats.totalLessons}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Уроків створено</h3>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-orange-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-orange-400">{stats.averageProgress.toFixed(0)}%</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Середній прогрес</h3>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-pink-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-pink-500/20 rounded-xl">
                <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-pink-400">{stats.totalAssignments}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Завдань створено</h3>
          </div>
        </div>

        <div className="relative group cursor-pointer" onClick={() => navigate('/teacher/pending')}>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-red-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-red-400">{stats.pendingSubmissions}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">На перевірку</h3>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Швидкі дії</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/teacher/courses"
            className="relative group overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 opacity-90 group-hover:opacity-100 transition"></div>
            <div className="relative p-6 text-white">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Мої курси</h3>
              <p className="text-purple-100 text-sm">Керувати курсами та уроками</p>
              <div className="mt-4 inline-flex items-center text-sm font-medium">
                Перейти <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          <Link
            to="/teacher/gradebook"
            className="relative group overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 opacity-90 group-hover:opacity-100 transition"></div>
            <div className="relative p-6 text-white">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Журнал</h3>
              <p className="text-indigo-100 text-sm">Оцінки та прогрес студентів</p>
              <div className="mt-4 inline-flex items-center text-sm font-medium">
                Відкрити <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          {courses.length > 0 && (
            <button
              onClick={handleAddLesson}
              className="relative group overflow-hidden rounded-2xl text-left cursor-pointer w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 opacity-90 group-hover:opacity-100 transition"></div>
              <div className="relative p-6 text-white">
                <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <h3 className="text-xl font-bold mb-2">Додати урок</h3>
                <p className="text-blue-100 text-sm">
                  {courses.length === 1 ? 'Створити новий урок до курсу' : 'Оберіть курс і створіть урок'}
                </p>
                <div className="mt-4 inline-flex items-center text-sm font-medium">
                  {courses.length === 1 ? 'Створити' : 'Обрати курс'} <span className="ml-2">→</span>
                </div>
              </div>
            </button>
          )}

          {courses.length > 0 && (
            <button
              onClick={handleViewStudents}
              className="relative group overflow-hidden rounded-2xl text-left cursor-pointer w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-600 opacity-90 group-hover:opacity-100 transition"></div>
              <div className="relative p-6 text-white">
                <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-xl font-bold mb-2">Аналітика студентів</h3>
                <p className="text-green-100 text-sm">
                  {courses.length === 1 ? 'Переглянути прогрес студентів' : 'Оберіть курс для перегляду аналітики'}
                </p>
                <div className="mt-4 inline-flex items-center text-sm font-medium">
                  {courses.length === 1 ? 'Переглянути' : 'Обрати курс'} <span className="ml-2">→</span>
                </div>
              </div>
            </button>
          )}

          {courses.length > 0 && (
            <button
              onClick={handleCreateAssignment}
              className="relative group overflow-hidden rounded-2xl text-left cursor-pointer w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600 opacity-90 group-hover:opacity-100 transition"></div>
              <div className="relative p-6 text-white">
                <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="text-xl font-bold mb-2">Створити завдання</h3>
                <p className="text-orange-100 text-sm">
                  {courses.length === 1 ? 'Тест, практика, есе чи проект' : 'Оберіть курс для створення завдання'}
                </p>
                <div className="mt-4 inline-flex items-center text-sm font-medium">
                  {courses.length === 1 ? 'Створити' : 'Обрати курс'} <span className="ml-2">→</span>
                </div>
              </div>
            </button>
          )}

          <Link
            to="/teacher/pending"
            className="relative group overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 to-amber-600 opacity-90 group-hover:opacity-100 transition"></div>
            <div className="relative p-6 text-white">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">На перевірку</h3>
              <p className="text-yellow-100 text-sm">Непер евірені завдання студентів</p>
              <div className="mt-4 inline-flex items-center text-sm font-medium">
                Перевірити <span className="ml-2">→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Top Courses */}
      {topCourses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Топ курси за кількістю студентів</h2>
          <div className="grid gap-4">
            {topCourses.map((course, index) => {
              const avgProgress = course.enrollments && course.enrollments.length > 0
                ? course.enrollments.reduce((s, e) => s + e.progress, 0) / course.enrollments.length
                : 0;

              return (
                <Link
                  key={course.id}
                  to={`/teacher/courses/${course.id}/edit`}
                  className="glass p-6 rounded-2xl border border-gray-700 hover:border-purple-500/50 transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      index === 1 ? 'bg-gray-400/20 text-gray-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          {course._count.enrollments} студентів
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {course._count.lessons} уроків
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400">{avgProgress.toFixed(0)}%</div>
                      <div className="text-xs text-gray-500">Середній прогрес</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Courses that need attention */}
      {needsAttention.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Потребують уваги
          </h2>
          <div className="grid gap-4">
            {needsAttention.map((course) => {
              const avgProgress = course.enrollments && course.enrollments.length > 0
                ? course.enrollments.reduce((s, e) => s + e.progress, 0) / course.enrollments.length
                : 0;

              return (
                <Link
                  key={course.id}
                  to={`/teacher/courses/${course.id}/students`}
                  className="glass p-6 rounded-2xl border border-yellow-500/30 hover:border-yellow-500/50 transition bg-yellow-500/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{course.title}</h3>
                      <p className="text-sm text-yellow-400 mt-1">
                        Низький середній прогрес студентів
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-400">{avgProgress.toFixed(0)}%</div>
                      <div className="text-xs text-gray-500">{course._count.enrollments} студентів</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {courses.length === 0 && (
        <div className="glass p-12 rounded-2xl text-center border border-gray-700">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">Ще немає курсів</h3>
          <p className="text-gray-400 mb-6">Зверніться до адміністратора для призначення курсів</p>
        </div>
      )}

      {/* Course Selector Modal */}
      {showCourseSelector && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCourseSelector(false)}
        >
          <div
            className="glass max-w-2xl w-full rounded-2xl border border-purple-500/30 p-8 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {selectorAction === 'lesson' 
                  ? 'Оберіть курс для додавання уроку' 
                  : selectorAction === 'assignment'
                  ? 'Оберіть курс для створення завдання'
                  : 'Оберіть курс для перегляду аналітики'}
              </h2>
              <button
                onClick={() => setShowCourseSelector(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {courses.map((course) => {
                const avgProgress = course.enrollments && course.enrollments.length > 0
                  ? course.enrollments.reduce((s, e) => s + e.progress, 0) / course.enrollments.length
                  : 0;

                return (
                  <button
                    key={course.id}
                    onClick={() => handleCourseSelect(course.id)}
                    className="w-full glass p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition group text-left"
                  >
                    <div className="flex items-center gap-4">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-purple-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition mb-2">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            {course._count.enrollments} студентів
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {course._count.lessons} уроків
                          </span>
                          <span className="text-purple-400 font-medium">{avgProgress.toFixed(0)}% прогрес</span>
                        </div>
                      </div>
                      <svg className="w-6 h-6 text-purple-400 opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;

