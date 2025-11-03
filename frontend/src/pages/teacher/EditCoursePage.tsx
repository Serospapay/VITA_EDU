import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
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
  price?: number;
  duration?: number;
  maxStudents?: number;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  _count?: {
    lessons: number;
    enrollments: number;
  };
}

interface Lesson {
  id: string;
  title: string;
  slug: string;
  content: string;
  videoUrl?: string;
  duration: number;
  order: number;
  type: string;
  isPublished: boolean;
  isFree: boolean;
  _count?: {
    assignments: number;
  };
}

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
  enrolledAt: string;
  completedAt?: string;
  user: Student;
}

const EditCoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as 'lessons' | 'assignments' | 'students' | null;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lessons' | 'assignments' | 'students'>(tabParam || 'lessons');
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });

  // Lesson Form
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    slug: '',
    content: '',
    videoUrl: '',
    duration: 0,
    order: 1,
    type: 'VIDEO',
    isPublished: false,
    isFree: false,
  });

  useEffect(() => {
    if (id) {
      fetchCourse();
      fetchLessons();
      fetchStudentsCount();
      fetchAssignments();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.data);
    } catch (error: any) {
      toast.error('Помилка завантаження курсу');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await api.get(`/lessons/course/${id}`);
      setLessons(response.data.data.sort((a: Lesson, b: Lesson) => a.order - b.order));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudentsCount = async () => {
    try {
      const response = await api.get(`/enrollments/course/${id}`);
      const enrollmentsData = response.data.data;
      setEnrollments(enrollmentsData);
      setStudentsCount(enrollmentsData.length);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/assignments/course/${id}`);
      setAssignments(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!window.confirm('Видалити це завдання? Цю дію не можна скасувати.')) return;
    
    try {
      await api.delete(`/assignments/${assignmentId}`);
      toast.success('Завдання видалено');
      fetchAssignments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка видалення');
    }
  };

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
      fetchStudentsCount(); // Reload data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка збереження оцінки');
    }
  };

  // Create/Update Lesson
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        await api.put(`/lessons/${editingLesson.id}`, lessonForm);
        toast.success('Урок оновлено!');
      } else {
        await api.post(`/lessons/course/${id}`, lessonForm);
        toast.success('Урок створено!');
      }
      
      setShowLessonForm(false);
      setEditingLesson(null);
      resetLessonForm();
      fetchLessons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка збереження');
    }
  };

  const resetLessonForm = () => {
    setLessonForm({
      title: '',
      slug: '',
      content: '',
      videoUrl: '',
      duration: 0,
      order: lessons.length + 1,
      type: 'VIDEO',
      isPublished: false,
      isFree: false,
    });
  };

  // Function reserved for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const _handleEditLesson = (lesson: Lesson) => {
  //   setEditingLesson(lesson);
  //   setShowLessonForm(true);
  // };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Видалити урок? Ця дія незворотна.')) return;

    try {
      await api.delete(`/lessons/${lessonId}`);
      toast.success('Урок видалено');
      fetchLessons();
    } catch (error) {
      toast.error('Помилка видалення');
    }
  };

  const handleCancelLessonForm = () => {
    setShowLessonForm(false);
    setEditingLesson(null);
    resetLessonForm();
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Редагування курсу</h1>
        <div className="text-center text-gray-400">Завантаження...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Редагування курсу</h1>
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
          Керування курсом
        </h1>
        <p className="text-xl text-gray-400">{course.title}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-purple-400">{lessons.length}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Уроків</h3>
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
              <span className="text-3xl font-bold text-blue-400">{studentsCount}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Студентів</h3>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
          <div className="relative glass p-6 rounded-2xl border border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${
                course.status === 'PUBLISHED'
                  ? 'bg-green-500/20'
                  : course.status === 'DRAFT'
                  ? 'bg-yellow-500/20'
                  : 'bg-gray-500/20'
              }`}>
                <svg className={`w-8 h-8 ${
                  course.status === 'PUBLISHED'
                    ? 'text-green-400'
                    : course.status === 'DRAFT'
                    ? 'text-yellow-400'
                    : 'text-gray-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className={`text-lg font-bold ${
                course.status === 'PUBLISHED'
                  ? 'text-green-400'
                  : course.status === 'DRAFT'
                  ? 'text-yellow-400'
                  : 'text-gray-400'
              }`}>
                {course.status === 'PUBLISHED'
                  ? 'Опубліковано'
                  : course.status === 'DRAFT'
                  ? 'Чернетка'
                  : course.status}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Статус курсу</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-2xl border border-gray-700">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'lessons'
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                : 'text-gray-400 hover:text-purple-300 hover:bg-gray-800/30'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Уроки ({lessons.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'assignments'
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                : 'text-gray-400 hover:text-purple-300 hover:bg-gray-800/30'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Завдання
            </div>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'students'
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                : 'text-gray-400 hover:text-purple-300 hover:bg-gray-800/30'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Студенти ({studentsCount})
            </div>
          </button>
        </div>

        <div className="p-8">
          {/* Lessons Tab */}
          {activeTab === 'lessons' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Управління уроками</h3>
                <button
                  onClick={() => {
                    setEditingLesson(null);
                    resetLessonForm();
                    setShowLessonForm(!showLessonForm);
                  }}
                  className="flex items-center gap-2 py-2.5 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition"
                >
                  {showLessonForm ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Скасувати
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Додати урок
                    </>
                  )}
                </button>
              </div>

              {/* Lesson Form */}
              {showLessonForm && (
                <form onSubmit={handleSaveLesson} className="glass p-6 rounded-xl border border-purple-500/30 space-y-4">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    {editingLesson ? 'Редагування уроку' : 'Новий урок'}
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Назва уроку *</label>
                      <input
                        type="text"
                        value={lessonForm.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          const slug = title.toLowerCase().replace(/[^a-z0-9а-яіїє]+/g, '-');
                          setLessonForm({ ...lessonForm, title, slug });
                        }}
                        required
                        className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
                        placeholder="Вступ до React"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Тривалість (хв) *</label>
                      <input
                        type="number"
                        value={lessonForm.duration}
                        onChange={(e) => setLessonForm({ ...lessonForm, duration: Number(e.target.value) })}
                        required
                        min="1"
                        className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Опис уроку *</label>
                    <textarea
                      value={lessonForm.content}
                      onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                      required
                      rows={4}
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
                      placeholder="Детальний опис того, що студенти вивчать в цьому уроці..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">URL відео (опціонально)</label>
                    <input
                      type="url"
                      value={lessonForm.videoUrl}
                      onChange={(e) => {
                        let url = e.target.value;
                        // Auto-convert YouTube URLs to embed format
                        if (url.includes('youtube.com/watch?v=')) {
                          const videoId = url.split('v=')[1]?.split('&')[0];
                          if (videoId) {
                            url = `https://www.youtube.com/embed/${videoId}`;
                          }
                        } else if (url.includes('youtu.be/')) {
                          const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                          if (videoId) {
                            url = `https://www.youtube.com/embed/${videoId}`;
                          }
                        }
                        setLessonForm({ ...lessonForm, videoUrl: url });
                      }}
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
                      placeholder="https://www.youtube.com/watch?v=... або https://youtu.be/..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Вставте будь-яке посилання YouTube - воно автоматично сконвертується
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lessonForm.isPublished}
                        onChange={(e) => setLessonForm({ ...lessonForm, isPublished: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm">Опублікувати</span>
                    </label>

                    <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lessonForm.isFree}
                        onChange={(e) => setLessonForm({ ...lessonForm, isFree: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm">Безкоштовний урок (доступний без реєстрації)</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition"
                    >
                      {editingLesson ? 'Оновити урок' : 'Створити урок'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelLessonForm}
                      className="py-2.5 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition"
                    >
                      Скасувати
                    </button>
                  </div>
                </form>
              )}

              {/* Lessons List */}
              {lessons.length === 0 ? (
                <div className="glass p-12 rounded-2xl text-center border border-gray-700">
                  <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-white mb-2">Уроків ще немає</h3>
                  <p className="text-gray-400">Додайте перший урок для курсу</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="group glass p-5 rounded-xl border border-gray-700 hover:border-purple-500/50 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-white text-lg">{lesson.title}</h4>
                              {lesson.isPublished ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Опубліковано
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded-full text-xs border border-gray-500/30">
                                  Чернетка
                                </span>
                              )}
                              {lesson.isFree && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs border border-blue-500/30">
                                  Безкоштовно
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mb-2 line-clamp-2">{lesson.content}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {lesson.duration} хв
                              </span>
                              {lesson.videoUrl && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  Відео
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                          <Link
                            to={`/teacher/courses/${id}/lessons/${lesson.id}/edit`}
                            className="p-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg transition"
                            title="Детально редагувати"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <Link
                            to={`/courses/${id}/lessons/${lesson.id}`}
                            target="_blank"
                            className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg transition"
                            title="Переглянути як студент"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg transition"
                            title="Видалити"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Студенти курсу</h3>
                <Link
                  to={`/teacher/courses/${id}/students`}
                  className="flex items-center gap-2 py-2.5 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Детальна аналітика
                </Link>
              </div>

              {enrollments.length === 0 ? (
                <div className="glass p-12 rounded-2xl text-center border border-gray-700">
                  <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-white mb-2">Студентів ще немає</h3>
                  <p className="text-gray-400">На цей курс ще не зареєстровано жодного студента</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrollments.map((enrollment) => {
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
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Завдання курсу</h3>
                <Link
                  to={`/teacher/courses/${id}/assignments/create`}
                  className="flex items-center gap-2 py-2.5 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Створити завдання
                </Link>
              </div>

              {assignments.length === 0 ? (
                <div className="glass p-12 rounded-2xl text-center border border-gray-700">
                  <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-xl font-semibold text-white mb-2">Створіть перше завдання</h3>
                  <p className="text-gray-400 mb-6">
                    Виберіть тип завдання: тест, практика, есе, проект або опитування
                  </p>
                  <Link
                    to={`/teacher/courses/${id}/assignments/create`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Почати
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {assignments.map((assignment: any) => {
                    const typeConfigs: Record<string, any> = {
                      TEST: { 
                        svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />, 
                        label: 'Тест', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', iconColor: 'text-blue-400' 
                      },
                      PRACTICAL: { 
                        svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />, 
                        label: 'Практика', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30', iconColor: 'text-purple-400' 
                      },
                      PROJECT: { 
                        svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />, 
                        label: 'Проект', color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', iconColor: 'text-yellow-400' 
                      },
                      QUIZ: { 
                        svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />, 
                        label: 'Опитування', color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30', iconColor: 'text-pink-400' 
                      },
                    };
                    
                    const typeConfig = typeConfigs[assignment.type] || { 
                      svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />, 
                      label: assignment.type, color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/30', iconColor: 'text-gray-400' 
                    };

                    return (
                      <div key={assignment.id} className={`glass rounded-xl border ${typeConfig.borderColor} hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] overflow-hidden group`}>
                        <div className="p-6">
                          <div className="flex items-start gap-4">
                            {/* Type Icon */}
                            <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${typeConfig.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                              <svg className={`w-7 h-7 ${typeConfig.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {typeConfig.svg}
                              </svg>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-400 transition">
                                    {assignment.title}
                                  </h4>
                                  <p className="text-sm text-gray-400 line-clamp-2">{assignment.description}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${typeConfig.color} text-white whitespace-nowrap`}>
                                  {typeConfig.label}
                                </span>
                              </div>

                              {/* Stats Row */}
                              <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                  <span>Макс: <strong className="text-purple-400">{assignment.maxScore}</strong> балів</span>
                                </div>
                                
                                {assignment.dueDate && (
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>До: <strong className="text-white">{new Date(assignment.dueDate).toLocaleDateString('uk-UA')}</strong></span>
                                  </div>
                                )}

                                {(assignment.type === 'TEST' || assignment.type === 'QUIZ') && assignment.timeLimit && (
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{assignment.timeLimit} хв</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                              <button
                                onClick={() => handleDeleteAssignment(assignment.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition group/btn"
                                title="Видалити"
                              >
                                <svg className="w-5 h-5 text-gray-400 group-hover/btn:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
              {(gradingSubmission as any).githubUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">GitHub репозиторій</label>
                  <a
                    href={(gradingSubmission as any).githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-4 glass rounded-xl border border-gray-700 hover:border-purple-500 transition group"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-purple-400 group-hover:underline">{(gradingSubmission as any).githubUrl}</span>
                    <svg className="w-4 h-4 text-gray-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Files */}
              {(gradingSubmission as any).files && (gradingSubmission as any).files.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Прикріплені файли</label>
                  <div className="space-y-2">
                    {(gradingSubmission as any).files.map((fileUrl: string, index: number) => {
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

export default EditCoursePage;
