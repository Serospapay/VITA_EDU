import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration: number;
  order: number;
  courseId: string;
  course: {
    id: string;
    title: string;
  };
}

const LessonViewPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-gray-400">Завантаження...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass p-8 rounded-2xl text-center">
          <p className="text-gray-400 mb-4">Урок не знайдено</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Повернутись назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
        <button
          onClick={() => navigate(`/courses/${courseId || lesson.courseId}`)}
          className="hover:text-purple-400 transition"
        >
          {lesson.course.title}
        </button>
        <span>/</span>
        <span className="text-white">{lesson.title}</span>
      </div>

      {/* Video Player */}
      {lesson.videoUrl && (
        <div className="glass p-4 rounded-2xl mb-8">
          <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
            <iframe
              src={lesson.videoUrl}
              title={lesson.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        </div>
      )}

      {/* Lesson Content */}
      <div className="glass p-8 rounded-2xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {lesson.title}
          </h1>
          <span className="badge bg-purple-500 text-white px-4 py-2">
            ⏱ {lesson.duration} хв
          </span>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {lesson.content}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate(`/courses/${courseId || lesson.courseId}`)}
          className="btn bg-gray-700 hover:bg-gray-600 text-white flex-1"
        >
          ← Повернутись до курсу
        </button>
        <button className="btn btn-primary flex-1">Наступний урок →</button>
      </div>
    </div>
  );
};

export default LessonViewPage;

