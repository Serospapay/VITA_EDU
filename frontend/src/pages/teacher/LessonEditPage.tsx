import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

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
  scheduledAt?: string;
  courseId: string;
  course?: {
    id: string;
    title: string;
  };
  files?: File[];
}

interface File {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

const LessonEditPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  // const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    videoUrl: '',
    duration: 0,
    scheduledAt: '',
    isPublished: false,
    isFree: false,
  });

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        duration: lesson.duration,
        scheduledAt: lesson.scheduledAt
          ? new Date(lesson.scheduledAt).toISOString().slice(0, 16)
          : '',
        isPublished: lesson.isPublished,
        isFree: lesson.isFree,
      });
    }
  }, [lesson]);

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/lessons/${lessonId}`);
      setLesson(response.data.data);
    } catch (error: any) {
      toast.error('Помилка завантаження уроку');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9а-яіїє]+/g, '-'),
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
      };

      await api.put(`/lessons/${lessonId}`, payload);
      toast.success('Урок збережено!');
      fetchLesson();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('lessonId', lessonId!);

    try {
      await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Файли завантажено!');
      fetchLesson();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка завантаження файлів');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Видалити файл?')) return;

    try {
      await api.delete(`/files/${fileId}`);
      toast.success('Файл видалено');
      fetchLesson();
    } catch (error) {
      toast.error('Помилка видалення файлу');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Редагування уроку</h1>
        <div className="text-center text-gray-400">Завантаження...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Редагування уроку</h1>
        <div className="glass p-8 rounded-2xl text-center">
          <p className="text-gray-400">Урок не знайдено</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          to={`/teacher/courses/${courseId}/edit`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад до курсу
        </Link>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Редагування уроку
        </h1>
        <p className="text-xl text-gray-400">{lesson.course?.title}</p>
      </div>

      {/* Tabs */}
      <div className="glass rounded-2xl border border-gray-700">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'edit'
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                : 'text-gray-400 hover:text-purple-300 hover:bg-gray-800/30'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Редагування
            </div>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'preview'
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                : 'text-gray-400 hover:text-purple-300 hover:bg-gray-800/30'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Перегляд (як у студентів)
            </div>
          </button>
        </div>

        <div className="p-8">
          {/* Edit Tab */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Назва уроку *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white text-lg placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
                  placeholder="Вступ до React"
                />
              </div>

              {/* Scheduled Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Дата і час проведення (опціонально)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none transition"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Вкажіть дату, коли урок буде доступний студентам (залиште порожнім для негайного доступу)
                </p>
              </div>

              {/* Duration & Video */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Тривалість (хв) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none transition"
                  />
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL відео (опціонально)
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
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
                    setFormData({ ...formData, videoUrl: url });
                  }}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
                  placeholder="https://www.youtube.com/watch?v=... або https://youtu.be/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Вставте будь-яке посилання YouTube - воно автоматично сконвертується
                </p>
              </div>
              </div>

              {/* Content (Large Textarea) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Зміст уроку *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={20}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition font-mono text-sm"
                  placeholder="Введіть детальний опис уроку. Можна використовувати markdown для форматування:

# Заголовок
## Підзаголовок

**Жирний текст**
*Курсив*

- Список
- Пункт 2

1. Нумерований список
2. Пункт 2

```js
// Блок коду
const example = 'Hello';
```

[Посилання](https://example.com)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Підказка: Можна використовувати Markdown для форматування тексту
                </p>
              </div>

              {/* File Upload */}
              <div className="glass p-6 rounded-xl border border-gray-700">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Прикріплені матеріали
                  </div>
                </label>

                {/* Existing Files */}
                {lesson.files && lesson.files.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {lesson.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <svg className="w-8 h-8 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{file.originalName}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)} • {file.mimeType}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg transition"
                            title="Завантажити"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg transition"
                            title="Видалити"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <label className="block">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                  />
                  <div className="flex items-center justify-center gap-2 py-3 px-6 bg-purple-600/20 hover:bg-purple-600/30 border-2 border-dashed border-purple-500/30 hover:border-purple-500/50 text-purple-400 rounded-xl font-medium transition cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Завантажити файли (PDF, DOC, PPT, XLS, ZIP)
                  </div>
                </label>
              </div>

              {/* Options */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm">Опублікувати (зробити доступним студентам)</span>
                </label>

                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm">Безкоштовний урок (доступний без реєстрації)</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-xl transition"
              >
                {saving ? 'Збереження...' : 'Зберегти зміни'}
              </button>
            </form>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              {/* Lesson Header */}
              <div className="border-b border-gray-700 pb-6">
                <h2 className="text-3xl font-bold text-white mb-4">{formData.title || lesson.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formData.duration || lesson.duration} хв
                  </div>
                  {formData.scheduledAt && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(formData.scheduledAt).toLocaleString('uk-UA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                  {formData.isFree && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">
                      Безкоштовно
                    </span>
                  )}
                  {!formData.isPublished && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs border border-yellow-500/30">
                      Чернетка
                    </span>
                  )}
                </div>
              </div>

              {/* Video */}
              {(formData.videoUrl || lesson.videoUrl) && (
                <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
                  <iframe
                    src={formData.videoUrl || lesson.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title={formData.title || lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    frameBorder="0"
                  />
                </div>
              )}

              {/* Content */}
              <div className="prose prose-invert prose-purple max-w-none">
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {formData.content || lesson.content}
                </div>
              </div>

              {/* Files */}
              {lesson.files && lesson.files.length > 0 && (
                <div className="glass p-6 rounded-xl border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Матеріали уроку
                  </h3>
                  <div className="grid gap-3">
                    {lesson.files.map((file) => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500/50 transition group"
                      >
                        <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <p className="font-medium text-white group-hover:text-purple-400 transition">
                            {file.originalName}
                          </p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonEditPage;

