import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Assignment {
  id: string;
  title: string;
  maxScore: number;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface Submission {
  id: string;
  content?: string;
  files?: string[];
  githubUrl?: string;
  submittedAt?: string;
  assignment: Assignment & { course: { id: string; title: string } };
  user: Student;
}

const PendingSubmissionsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  // const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ search: '', courseId: 'ALL' });
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      if (!user) return;

      // Fetch teacher's courses
      const coursesRes = await api.get(`/courses/teacher/${user.id}`);
      setCourses(coursesRes.data.data);

      // Fetch all pending submissions using the new endpoint
      const submissionsRes = await api.get('/submissions/teacher/pending');
      const allPendingSubmissions: Submission[] = submissionsRes.data.data.map((submission: any) => ({
        id: submission.id,
        content: submission.content,
        files: submission.files || [],
        githubUrl: submission.githubUrl,
        submittedAt: submission.submittedAt,
        assignment: {
          ...submission.assignment,
          course: submission.assignment.course,
        },
        user: submission.user,
      }));

      setSubmissions(allPendingSubmissions);
    } catch (error: any) {
      toast.error('Помилка завантаження даних');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeClick = (submission: Submission) => {
    setGradingSubmission(submission);
    setGradeForm({
      score: '',
      feedback: '',
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
      fetchData(); // Reload data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка збереження оцінки');
    }
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.user.firstName.toLowerCase().includes(filter.search.toLowerCase()) ||
      submission.user.lastName.toLowerCase().includes(filter.search.toLowerCase()) ||
      submission.assignment.title.toLowerCase().includes(filter.search.toLowerCase());

    const matchesCourse =
      filter.courseId === 'ALL' || submission.assignment.course.id === filter.courseId;

    return matchesSearch && matchesCourse;
  });

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">На перевірку</h1>
        <div className="text-center text-gray-400">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Завдання на перевірку
        </h1>
        <p className="text-gray-400">
          {submissions.length === 0 ? 'Немає завдань на перевірку' : `${submissions.length} завдань очікують перевірки`}
        </p>
      </div>

      {/* Filters */}
      {submissions.length > 0 && (
        <div className="glass p-6 rounded-2xl border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Пошук</label>
              <input
                type="text"
                placeholder="Студент або завдання..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Курс</label>
              <select
                value={filter.courseId}
                onChange={(e) => setFilter({ ...filter, courseId: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none transition"
              >
                <option value="ALL">Всі курси</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center border border-gray-700">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">
            {filter.search || filter.courseId !== 'ALL' ? 'Нічого не знайдено' : 'Немає завдань на перевірку'}
          </h3>
          <p className="text-gray-400">
            {filter.search || filter.courseId !== 'ALL'
              ? 'Спробуйте змінити фільтри'
              : 'Всі завдання перевірені!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="glass rounded-xl border border-yellow-500/30 hover:border-yellow-500/50 transition p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {/* Student Avatar */}
                    {submission.user.avatar ? (
                      <img
                        src={submission.user.avatar}
                        alt={`${submission.user.firstName} ${submission.user.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                        {submission.user.firstName[0]}{submission.user.lastName[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {submission.user.firstName} {submission.user.lastName}
                      </h3>
                      <p className="text-sm text-gray-400">{submission.user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-white font-medium">
                      <span className="text-purple-400">Завдання:</span> {submission.assignment.title}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="text-blue-400">Курс:</span> {submission.assignment.course.title}
                    </p>
                    {submission.submittedAt && (
                      <p className="text-sm text-gray-500">
                        Здано: {new Date(submission.submittedAt).toLocaleDateString('uk-UA', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleGradeClick(submission)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Перевірити
                </button>
              </div>
            </div>
          ))}
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
              <h2 className="text-2xl font-bold text-white">Перевірка завдання</h2>
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
              {/* Student Info */}
              <div className="glass p-4 rounded-xl border border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Студент</h4>
                <p className="text-white font-medium">
                  {gradingSubmission.user.firstName} {gradingSubmission.user.lastName}
                </p>
                <p className="text-sm text-gray-400">{gradingSubmission.user.email}</p>
              </div>

              {/* Assignment Info */}
              <div className="glass p-4 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">{gradingSubmission.assignment.title}</h3>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Курс: {gradingSubmission.assignment.course.title}</p>
                  <p>Максимальна оцінка: {gradingSubmission.assignment.maxScore} балів</p>
                  {gradingSubmission.submittedAt && (
                    <p>Здано: {new Date(gradingSubmission.submittedAt).toLocaleString('uk-UA')}</p>
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
                  <div className="glass p-4 rounded-xl border border-gray-700 max-h-60 overflow-y-auto">
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

export default PendingSubmissionsPage;



