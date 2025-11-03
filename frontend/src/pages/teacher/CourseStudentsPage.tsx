import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Assignment {
  id: string;
  title: string;
  maxScore: number;
}

interface Submission {
  id: string;
  status: string;
  score?: number;
  feedback?: string;
  content?: string;
  files?: string[];
  githubUrl?: string;
  submittedAt?: string;
  gradedAt?: string;
  assignment: Assignment;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  submissions?: Submission[];
}

interface Enrollment {
  id: string;
  progress: number;
  completedAt: string | null;
  enrolledAt: string;
  user: Student;
}

interface Course {
  id: string;
  title: string;
}

const CourseStudentsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });
  const [filter, setFilter] = useState({
    search: '',
    sortBy: 'progress',
    progressFilter: 'ALL', // ALL, LOW (<30%), MEDIUM (30-70%), HIGH (>70%)
  });

  const toggleStudentExpand = (studentId: string) => {
    setExpandedStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleGradeClick = (submission: Submission) => {
    setGradingSubmission(submission);
    setGradeForm({
      score: submission.score?.toString() || '',
      feedback: submission.feedback || '',
    });
  };

  const handleGradeSubmit = async () => {
    if (!gradingSubmission) return;

    try {
      const score = parseFloat(gradeForm.score);
      if (isNaN(score)) {
        toast.error('Введіть коректну оцінку');
        return;
      }

      await api.put(`/submissions/${gradingSubmission.id}/grade`, {
        score,
        feedback: gradeForm.feedback,
      });

      toast.success('Оцінку виставлено!');
      setGradingSubmission(null);
      setGradeForm({ score: '', feedback: '' });
      fetchCourseAndStudents(); // Reload data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка збереження оцінки');
    }
  };

  useEffect(() => {
    if (id) {
      fetchCourseAndStudents();
    }
  }, [id]);

  const fetchCourseAndStudents = async () => {
    try {
      // Fetch course details
      const courseRes = await api.get(`/courses/${id}`);
      setCourse(courseRes.data.data);

      // Fetch enrollments with student details
      const enrollRes = await api.get(`/enrollments/course/${id}`);
      setEnrollments(enrollRes.data.data);
    } catch (error: any) {
      toast.error('Помилка завантаження даних');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort students
  const filteredEnrollments = enrollments
    .filter((enrollment) => {
      const matchesSearch =
        enrollment.user.firstName.toLowerCase().includes(filter.search.toLowerCase()) ||
        enrollment.user.lastName.toLowerCase().includes(filter.search.toLowerCase()) ||
        enrollment.user.email.toLowerCase().includes(filter.search.toLowerCase());

      const matchesProgress =
        filter.progressFilter === 'ALL' ||
        (filter.progressFilter === 'LOW' && enrollment.progress < 30) ||
        (filter.progressFilter === 'MEDIUM' && enrollment.progress >= 30 && enrollment.progress <= 70) ||
        (filter.progressFilter === 'HIGH' && enrollment.progress > 70);

      return matchesSearch && matchesProgress;
    })
    .sort((a, b) => {
      if (filter.sortBy === 'progress') {
        return b.progress - a.progress;
      } else if (filter.sortBy === 'name') {
        return a.user.lastName.localeCompare(b.user.lastName);
      } else if (filter.sortBy === 'date') {
        return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
      }
      return 0;
    });

  const avgProgress =
    enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
      : 0;

  const completedCount = enrollments.filter((e) => e.completedAt).length;

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Студенти курсу</h1>
        <div className="text-center text-gray-400">Завантаження...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Студенти курсу</h1>
        <div className="glass p-8 rounded-2xl text-center">
          <p className="text-gray-400">Курс не знайдено</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/teacher/courses"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад до курсів
        </Link>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Студенти курсу
        </h1>
        <p className="text-xl text-gray-400">{course.title}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-blue-400">{enrollments.length}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Всього студентів</h3>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-green-400">{completedCount}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Завершили курс</h3>
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
              <span className="text-3xl font-bold text-orange-400">{avgProgress.toFixed(0)}%</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Середній прогрес</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass p-6 rounded-2xl border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Пошук</label>
            <input
              type="text"
              placeholder="Ім'я, прізвище або email..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Прогрес</label>
            <select
              value={filter.progressFilter}
              onChange={(e) => setFilter({ ...filter, progressFilter: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none transition"
            >
              <option value="ALL">Усі студенти</option>
              <option value="LOW">Низький (&lt; 30%)</option>
              <option value="MEDIUM">Середній (30-70%)</option>
              <option value="HIGH">Високий (&gt; 70%)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Сортування</label>
            <select
              value={filter.sortBy}
              onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none transition"
            >
              <option value="progress">За прогресом</option>
              <option value="name">За алфавітом</option>
              <option value="date">За датою реєстрації</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Cards */}
      {filteredEnrollments.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center border border-gray-700">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">Студентів не знайдено</h3>
          <p className="text-gray-400">
            {filter.search || filter.progressFilter !== 'ALL'
              ? 'Спробуйте змінити фільтри'
              : 'Поки що ніхто не записався на цей курс'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEnrollments.map((enrollment) => {
            const isExpanded = expandedStudents.has(enrollment.user.id);
            const submissions = enrollment.user.submissions || [];
            const avgScore = submissions.length > 0
              ? submissions.filter(s => s.score).reduce((sum, s) => sum + (s.score || 0), 0) / submissions.filter(s => s.score).length
              : 0;
            const completedAssignments = submissions.filter(s => s.status === 'GRADED').length;
            const pendingAssignments = submissions.filter(s => s.status === 'PENDING').length;

            return (
              <div
                key={enrollment.id}
                className="glass rounded-xl border border-gray-700 hover:border-purple-500/50 transition overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {enrollment.user.avatar ? (
                        <img
                          src={enrollment.user.avatar}
                          alt={`${enrollment.user.firstName} ${enrollment.user.lastName}`}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                          {enrollment.user.firstName[0]}{enrollment.user.lastName[0]}
                        </div>
                      )}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-white truncate">
                        {enrollment.user.firstName} {enrollment.user.lastName}
                      </h4>
                      <p className="text-sm text-gray-400 truncate">{enrollment.user.email}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-xs text-gray-500">
                          Записався: {new Date(enrollment.enrolledAt).toLocaleDateString('uk-UA')}
                        </span>
                        {submissions.length > 0 && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="text-xs text-blue-400">
                              {completedAssignments} перевірено, {pendingAssignments} на перевірці
                            </span>
                          </>
                        )}
                        {avgScore > 0 && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className={`text-xs font-medium ${
                              avgScore >= 90 ? 'text-green-400' :
                              avgScore >= 75 ? 'text-blue-400' :
                              avgScore >= 60 ? 'text-yellow-400' :
                              'text-orange-400'
                            }`}>
                              Середня оцінка: {avgScore.toFixed(0)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats and Actions */}
                    <div className="flex-shrink-0 flex items-center gap-3">
                      {/* Progress */}
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">Прогрес</span>
                          <span className="text-sm font-bold text-purple-400">{enrollment.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              enrollment.progress === 100
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : enrollment.progress >= 50
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500'
                            }`}
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() => toggleStudentExpand(enrollment.user.id)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition"
                        title={isExpanded ? 'Згорнути' : 'Детальніше'}
                      >
                        <svg
                          className={`w-5 h-5 text-purple-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-700 bg-gray-900/50 p-6">
                    <h5 className="text-sm font-semibold text-white mb-4">Виконані завдання</h5>
                    
                    {submissions.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Студент ще не здав жодного завдання</p>
                    ) : (
                      <div className="space-y-3">
                        {submissions.map((submission) => (
                          <div
                            key={submission.id}
                            className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h6 className="font-medium text-white mb-1">
                                  {submission.assignment.title}
                                </h6>
                                {submission.submittedAt && (
                                  <p className="text-xs text-gray-500 mb-2">
                                    Здано: {new Date(submission.submittedAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                )}
                                {submission.feedback && (
                                  <p className="text-sm text-gray-400 mt-2">
                                    <span className="text-purple-400 font-medium">Відгук: </span>
                                    {submission.feedback}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  submission.status === 'GRADED'
                                    ? 'bg-green-500/20 text-green-400'
                                    : submission.status === 'PENDING'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {submission.status === 'GRADED' ? 'Перевірено' : 
                                   submission.status === 'PENDING' ? 'На перевірці' : 
                                   'Не здано'}
                                </span>
                                {submission.score !== undefined && submission.score !== null && (
                                  <div className="text-right">
                                    <p className={`text-lg font-bold ${
                                      submission.score >= 90 ? 'text-green-400' :
                                      submission.score >= 75 ? 'text-blue-400' :
                                      submission.score >= 60 ? 'text-yellow-400' :
                                      'text-orange-400'
                                    }`}>
                                      {submission.score} / {submission.assignment.maxScore}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {((submission.score / submission.assignment.maxScore) * 100).toFixed(0)}%
                                    </p>
                                  </div>
                                )}
                                <button
                                  onClick={() => handleGradeClick(submission)}
                                  className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {submission.status === 'GRADED' ? (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    ) : (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    )}
                                  </svg>
                                  {submission.status === 'GRADED' ? 'Переглянути' : 'Перевірити'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Grading Modal */}
      {gradingSubmission && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setGradingSubmission(null)}
        >
          <div
            className="glass max-w-2xl w-full rounded-2xl border border-purple-500/30 p-8 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {gradingSubmission.status === 'GRADED' ? 'Перегляд завдання' : 'Перевірка завдання'}
              </h2>
              <button
                onClick={() => setGradingSubmission(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Assignment Info */}
              <div className="glass p-4 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">{gradingSubmission.assignment.title}</h3>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Максимальна оцінка: {gradingSubmission.assignment.maxScore} балів</p>
                  {gradingSubmission.submittedAt && (
                    <p>Здано: {new Date(gradingSubmission.submittedAt).toLocaleString('uk-UA')}</p>
                  )}
                  {gradingSubmission.gradedAt && (
                    <p>Перевірено: {new Date(gradingSubmission.gradedAt).toLocaleString('uk-UA')}</p>
                  )}
                </div>
              </div>

              {/* GitHub URL */}
              {gradingSubmission.githubUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">GitHub репозиторій</label>
                  <a
                    href={gradingSubmission.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-4 glass rounded-xl border border-gray-700 hover:border-purple-500 transition group"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-purple-400 group-hover:underline">{gradingSubmission.githubUrl}</span>
                    <svg className="w-4 h-4 text-gray-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Files */}
              {gradingSubmission.files && gradingSubmission.files.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Прикріплені файли</label>
                  <div className="space-y-2">
                    {gradingSubmission.files.map((fileUrl: string, index: number) => {
                      const fileName = fileUrl.split('/').pop() || 'file';
                      const ext = fileName.split('.').pop()?.toLowerCase() || '';
                      const isCode = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'html', 'css', 'json'].includes(ext);
                      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
                      
                      return (
                        <a
                          key={index}
                          href={`http://localhost:5000${fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 glass rounded-lg border border-gray-700 hover:border-purple-500 transition group"
                        >
                          <div className={`p-2 rounded-lg ${isCode ? 'bg-blue-500/20' : isImage ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                            {isCode ? (
                              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                              </svg>
                            ) : isImage ? (
                              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate group-hover:text-purple-400 transition">{fileName}</p>
                            <p className="text-xs text-gray-500">{ext.toUpperCase()} файл</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Student's Work / Description */}
              {gradingSubmission.content && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Опис / Примітки студента</label>
                  <div className="glass p-4 rounded-xl border border-gray-700">
                    <p className="text-white whitespace-pre-wrap">{gradingSubmission.content}</p>
                  </div>
                </div>
              )}

              {/* Score Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Оцінка (0 - {gradingSubmission.assignment.maxScore}) *
                </label>
                <input
                  type="number"
                  min="0"
                  max={gradingSubmission.assignment.maxScore}
                  step="0.1"
                  value={gradeForm.score}
                  onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
                  placeholder="Введіть оцінку"
                />
              </div>

              {/* Feedback Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Відгук (опціонально)</label>
                <textarea
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition resize-none"
                  placeholder="Напишіть відгук для студента..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setGradingSubmission(null)}
                  className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleGradeSubmit}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition"
                >
                  Зберегти оцінку
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseStudentsPage;

