import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface GradeEntry {
  id: string;
  score: number | null;
  maxScore: number;
  status: 'PENDING' | 'GRADED' | 'RETURNED';
  feedback: string | null;
  content?: string;
  files?: string[];
  githubUrl?: string;
  submittedAt: string;
  gradedAt: string | null;
  assignment: {
    id: string;
    title: string;
    type: string;
    maxScore: number;
    course: {
      id: string;
      title: string;
    };
  };
}

interface CourseStats {
  courseId: string;
  courseTitle: string;
  totalAssignments: number;
  completedAssignments: number;
  averageGrade: number | null;
  progress: number;
}

const StudentGradebook = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [viewingSubmission, setViewingSubmission] = useState<GradeEntry | null>(null);

  useEffect(() => {
    fetchGrades();
  }, [user]);

  const fetchGrades = async () => {
    try {
      if (!user) return;

      // Fetch all submissions with grades
      const response = await api.get('/submissions/my');
      const submissions = response.data.data || [];
      setGrades(submissions);

      // Calculate stats per course
      const statsMap = new Map<string, CourseStats>();
      
      submissions.forEach((sub: GradeEntry) => {
        const courseId = sub.assignment.course.id;
        const courseTitle = sub.assignment.course.title;
        
        if (!statsMap.has(courseId)) {
          statsMap.set(courseId, {
            courseId,
            courseTitle,
            totalAssignments: 0,
            completedAssignments: 0,
            averageGrade: null,
            progress: 0,
          });
        }
        
        const stats = statsMap.get(courseId)!;
        stats.totalAssignments++;
        
        if (sub.status === 'GRADED' && sub.score !== null) {
          stats.completedAssignments++;
        }
      });

      // Calculate averages
      statsMap.forEach((stats) => {
        const courseGrades = submissions
          .filter((s: GradeEntry) => 
            s.assignment.course.id === stats.courseId && 
            s.status === 'GRADED' && 
            s.score !== null
          );
        
        if (courseGrades.length > 0) {
          const total = courseGrades.reduce((sum: number, s: GradeEntry) => 
            sum + ((s.score || 0) / s.maxScore * 100), 0
          );
          stats.averageGrade = total / courseGrades.length;
        }
        
        stats.progress = stats.totalAssignments > 0 
          ? (stats.completedAssignments / stats.totalAssignments) * 100 
          : 0;
      });

      setCourseStats(Array.from(statsMap.values()));
    } catch (error: any) {
      console.error(error);
      toast.error('Помилка завантаження оцінок');
    } finally {
      setLoading(false);
    }
  };

  const filteredGrades = selectedCourse === 'all' 
    ? grades 
    : grades.filter(g => g.assignment.course.id === selectedCourse);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GRADED':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">Оцінено</span>;
      case 'PENDING':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">На перевірці</span>;
      case 'RETURNED':
        return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">Повернуто</span>;
      default:
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 75) return 'text-blue-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
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
          Мій електронний щоденник
        </h1>
        <p className="text-gray-400">Всі ваші оцінки та прогрес по курсах</p>
      </div>

      {/* Course Stats */}
      {courseStats.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Статистика по курсах</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseStats.map((stats) => (
              <div key={stats.courseId} className="glass p-6 rounded-2xl border border-gray-700">
                <h3 className="font-bold text-white mb-4 truncate">{stats.courseTitle}</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Середній бал</span>
                    <span className={`font-bold ${stats.averageGrade !== null ? getGradeColor(stats.averageGrade) : 'text-gray-500'}`}>
                      {stats.averageGrade !== null ? stats.averageGrade.toFixed(1) : '—'}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Виконано завдань</span>
                    <span className="font-semibold text-white">
                      {stats.completedAssignments} / {stats.totalAssignments}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Прогрес</span>
                      <span>{stats.progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Link
                  to={`/dashboard/courses/${stats.courseId}/assignments`}
                  className="btn btn-primary w-full mt-4 text-sm"
                >
                  Переглянути завдання
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      {courseStats.length > 1 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Фільтр за курсом</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCourse('all')}
              className={`px-6 py-2 rounded-xl font-medium transition ${
                selectedCourse === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'glass text-gray-400 hover:text-white'
              }`}
            >
              Всі курси ({grades.length})
            </button>
            {courseStats.map((stats) => (
              <button
                key={stats.courseId}
                onClick={() => setSelectedCourse(stats.courseId)}
                className={`px-6 py-2 rounded-xl font-medium transition ${
                  selectedCourse === stats.courseId
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                    : 'glass text-gray-400 hover:text-white'
                }`}
              >
                {stats.courseTitle} ({grades.filter(g => g.assignment.course.id === stats.courseId).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grades Table */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Всі оцінки</h2>
        {filteredGrades.length === 0 ? (
          <div className="glass p-12 rounded-2xl text-center">
            <p className="text-gray-400">Немає оцінок для відображення</p>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-800/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Завдання</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Курс</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Тип</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Статус</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Оцінка</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Дата</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredGrades.map((grade) => {
                    const percentage = grade.score !== null ? (grade.score / grade.maxScore) * 100 : null;
                    
                    return (
                      <tr key={grade.id} className="hover:bg-gray-800/30 transition">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-white">{grade.assignment.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-400">{grade.assignment.course.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="badge badge-primary text-xs">{grade.assignment.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(grade.status)}
                        </td>
                        <td className="px-6 py-4">
                          {grade.score !== null && percentage !== null ? (
                            <div>
                              <p className={`font-bold ${getGradeColor(percentage)}`}>
                                {grade.score} / {grade.maxScore}
                              </p>
                              <p className="text-xs text-gray-500">{percentage.toFixed(0)}%</p>
                            </div>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {grade.gradedAt 
                            ? new Date(grade.gradedAt).toLocaleDateString('uk-UA') 
                            : new Date(grade.submittedAt).toLocaleDateString('uk-UA')}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setViewingSubmission(grade)}
                            className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                          >
                            Деталі
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Submission Details Modal */}
      {viewingSubmission && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setViewingSubmission(null)}
        >
          <div
            className="glass max-w-2xl w-full rounded-2xl border border-purple-500/30 p-8 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{viewingSubmission.assignment.title}</h2>
              <button
                onClick={() => setViewingSubmission(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Status and Score */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Статус</p>
                  {getStatusBadge(viewingSubmission.status)}
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Оцінка</p>
                  {viewingSubmission.score !== null ? (
                    <p className="text-2xl font-bold text-green-400">
                      {viewingSubmission.score} / {viewingSubmission.maxScore}
                    </p>
                  ) : (
                    <p className="text-gray-500">Ще не оцінено</p>
                  )}
                </div>
              </div>

              {/* GitHub URL */}
              {viewingSubmission.githubUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">GitHub репозиторій</label>
                  <a
                    href={viewingSubmission.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-4 glass rounded-xl border border-gray-700 hover:border-purple-500 transition group"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-purple-400 group-hover:underline">{viewingSubmission.githubUrl}</span>
                    <svg className="w-4 h-4 text-gray-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Files */}
              {viewingSubmission.files && viewingSubmission.files.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Прикріплені файли</label>
                  <div className="space-y-2">
                    {viewingSubmission.files.map((fileUrl: string, index: number) => {
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

              {/* Content / Description */}
              {viewingSubmission.content && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ваш опис / примітки</label>
                  <div className="glass p-4 rounded-xl border border-gray-700">
                    <p className="text-white whitespace-pre-wrap">{viewingSubmission.content}</p>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {viewingSubmission.feedback && (
                <div className="glass p-6 rounded-xl border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <h3 className="font-semibold text-white">Відгук викладача</h3>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{viewingSubmission.feedback}</p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Здано</p>
                  <p className="text-white font-medium">
                    {new Date(viewingSubmission.submittedAt).toLocaleString('uk-UA')}
                  </p>
                </div>
                {viewingSubmission.gradedAt && (
                  <div>
                    <p className="text-gray-400 mb-1">Оцінено</p>
                    <p className="text-white font-medium">
                      {new Date(viewingSubmission.gradedAt).toLocaleString('uk-UA')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGradebook;



