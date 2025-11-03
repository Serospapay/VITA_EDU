import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Assignment {
  id: string;
  title: string;
  description: string;
  maxScore: number;
  dueDate?: string;
  mySubmission?: {
    id: string;
    content?: string;
    files?: string[];
    githubUrl?: string;
    status: string;
    score?: number;
    feedback?: string;
    submittedAt?: string;
    gradedAt?: string;
  } | null;
}

interface Course {
  id: string;
  title: string;
}

const MyAssignmentsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseAndAssignments();
    }
  }, [courseId]);

  const fetchCourseAndAssignments = async () => {
    try {
      // Fetch course details
      const courseRes = await api.get(`/courses/${courseId}`);
      setCourse(courseRes.data.data);

      // Fetch assignments with my submissions
      const assignmentsRes = await api.get(`/assignments/course/${courseId}`);
      setAssignments(assignmentsRes.data.data);
    } catch (error: any) {
      toast.error('Помилка завантаження завдань');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!submittingAssignment) return;

    // Validate that at least one field is filled
    if (!submissionContent.trim() && selectedFiles.length === 0 && !githubUrl.trim()) {
      toast.error('Додайте опис, файли або посилання на GitHub');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('assignmentId', submittingAssignment.id);
      
      if (submissionContent.trim()) {
        formData.append('content', submissionContent);
      }
      
      if (githubUrl.trim()) {
        formData.append('githubUrl', githubUrl);
      }
      
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      await api.post('/submissions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Завдання здано успішно!');
      setSubmittingAssignment(null);
      setSubmissionContent('');
      setGithubUrl('');
      setSelectedFiles([]);
      fetchCourseAndAssignments(); // Reload to get updated status
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка здачі завдання');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      toast.error('Максимум 5 файлів');
      return;
    }
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length + selectedFiles.length > 5) {
      toast.error('Максимум 5 файлів');
      return;
    }
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleOpenSubmitModal = (assignment: Assignment) => {
    setSubmittingAssignment(assignment);
    setSubmissionContent(assignment.mySubmission?.content || '');
    setGithubUrl(assignment.mySubmission?.githubUrl || '');
    setSelectedFiles([]);
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Завдання</h1>
        <div className="text-center text-gray-400">Завантаження...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Завдання</h1>
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
        <button
          onClick={() => navigate(`/dashboard/my-courses`)}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад до моїх курсів
        </button>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Завдання курсу
        </h1>
        <p className="text-xl text-gray-400">{course.title}</p>
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center border border-gray-700">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">Завдань поки немає</h3>
          <p className="text-gray-400">Викладач ще не створив завдань для цього курсу</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const submission = assignment.mySubmission;
            const isSubmitted = !!submission;
            const isGraded = submission?.status === 'GRADED';
            const isPending = submission?.status === 'PENDING';
            const isDueSoon = assignment.dueDate && new Date(assignment.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
            const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();

            return (
              <div
                key={assignment.id}
                className={`glass rounded-xl border transition p-6 ${
                  isGraded
                    ? 'border-green-500/30'
                    : isPending
                    ? 'border-yellow-500/30'
                    : isOverdue
                    ? 'border-red-500/30'
                    : 'border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{assignment.title}</h3>
                    <p className="text-gray-400 mb-4">{assignment.description}</p>

                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-sm text-gray-500">
                        Максимально балів: <span className="text-purple-400 font-medium">{assignment.maxScore}</span>
                      </span>
                      {assignment.dueDate && (
                        <span className={`text-sm ${isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : 'text-gray-500'}`}>
                          Кінцевий термін: {new Date(assignment.dueDate).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {/* Submission Status */}
                    {isSubmitted && (
                      <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                            isGraded ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {isGraded ? 'Перевірено' : 'На перевірці'}
                          </span>
                          {isGraded && submission?.score !== undefined && (
                            <span className={`text-lg font-bold ${
                              submission.score >= assignment.maxScore * 0.9 ? 'text-green-400' :
                              submission.score >= assignment.maxScore * 0.75 ? 'text-blue-400' :
                              submission.score >= assignment.maxScore * 0.6 ? 'text-yellow-400' :
                              'text-orange-400'
                            }`}>
                              {submission.score} / {assignment.maxScore}
                            </span>
                          )}
                        </div>
                        {submission?.submittedAt && (
                          <p className="text-xs text-gray-500 mb-2">
                            Здано: {new Date(submission.submittedAt).toLocaleString('uk-UA')}
                          </p>
                        )}
                        {isGraded && submission?.feedback && (
                          <div className="mt-3 p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                            <p className="text-sm text-purple-300 font-medium mb-1">Відгук викладача:</p>
                            <p className="text-sm text-gray-300">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    {!isGraded && (
                      <button
                        onClick={() => handleOpenSubmitModal(assignment)}
                        className={`px-6 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
                          isSubmitted
                            ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {isSubmitted ? 'Переглянути / Редагувати' : 'Здати завдання'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {submittingAssignment && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSubmittingAssignment(null)}
        >
          <div
            className="glass max-w-2xl w-full rounded-2xl border border-purple-500/30 p-8 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Здати завдання</h2>
              <button
                onClick={() => setSubmittingAssignment(null)}
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
                <h3 className="text-lg font-semibold text-white mb-2">{submittingAssignment.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{submittingAssignment.description}</p>
                <div className="text-sm text-gray-500">
                  <p>Максимально балів: {submittingAssignment.maxScore}</p>
                  {submittingAssignment.dueDate && (
                    <p>Кінцевий термін: {new Date(submittingAssignment.dueDate).toLocaleString('uk-UA')}</p>
                  )}
                </div>
              </div>

              {/* GitHub URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Посилання на GitHub репозиторій (опціонально)
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
                    placeholder="https://github.com/username/repository"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Файли (до 5 файлів, макс. 10MB кожен)
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition ${
                    isDragging
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-600 hover:border-purple-500/50'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.html,.css,.scss,.json,.xml,.yml,.yaml,.sql,.pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.svg,.zip,.rar,.7z,.tar,.gz"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-400 mb-1">
                    Перетягніть файли сюди або натисніть для вибору
                  </p>
                  <p className="text-xs text-gray-600">
                    Підтримуються: код, документи, зображення, архіви
                  </p>
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="ml-3 p-1 hover:bg-red-500/20 rounded-lg transition text-red-400"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description / Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Опис / Примітки (опціонально)
                </label>
                <textarea
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition resize-none"
                  placeholder="Опишіть ваше рішення, додайте коментарі або інструкції..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition"
                >
                  {submittingAssignment.mySubmission ? 'Оновити рішення' : 'Здати завдання'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAssignmentsPage;

