import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc?: string;
  thumbnail?: string;
  categoryId: string;
  teacherId: string;
  level: string;
  status: string;
  price: number;
  duration: number;
  maxStudents: number;
}

const EditCourseForAdmin = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDesc: '',
    thumbnail: '',
    categoryId: '',
    teacherId: '',
    level: 'BEGINNER',
    status: 'DRAFT',
    price: 0,
    duration: 0,
    maxStudents: 50,
  });

  useEffect(() => {
    if (id) {
      fetchCourse();
      fetchCategories();
      fetchTeachers();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/courses/${id}`);
      const courseData = response.data.data;
      setCourse(courseData);
      setFormData({
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        shortDesc: courseData.shortDesc || '',
        thumbnail: courseData.thumbnail || '',
        categoryId: courseData.categoryId,
        teacherId: courseData.teacherId,
        level: courseData.level,
        status: courseData.status,
        price: courseData.price,
        duration: courseData.duration,
        maxStudents: courseData.maxStudents,
      });
    } catch (error: any) {
      toast.error('Помилка завантаження курсу');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/users?limit=100');
      const usersData = response.data.data;
      const users = usersData.users || usersData;
      const teachersList = users.filter((u: any) => u.role === 'TEACHER');
      setTeachers(teachersList);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/courses/${id}`, formData);
      toast.success('Курс оновлено!');
      navigate('/admin/courses');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка оновлення');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' || name === 'maxStudents' ? Number(value) : value,
    }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center text-gray-400">Завантаження...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass p-8 rounded-2xl text-center">
          <p className="text-gray-400">Курс не знайдено</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Редагувати курс (Адмін)
        </h1>
        <button
          onClick={() => navigate('/admin/courses')}
          className="btn bg-gray-700 hover:bg-gray-600 text-white"
        >
          ← Назад
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Назва курсу *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="input w-full"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            URL (slug) *
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className="input w-full"
          />
        </div>

        {/* Teacher Selection - ВАЖЛИВО для адміна */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Викладач курсу *
          </label>
          <select
            name="teacherId"
            value={formData.teacherId}
            onChange={handleChange}
            required
            className="input w-full"
          >
            <option value="">Оберіть викладача</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName} ({teacher.email})
              </option>
            ))}
          </select>
          <p className="text-xs text-yellow-400 mt-1">
            ● Зміна викладача передасть контроль іншому користувачу
          </p>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Короткий опис
          </label>
          <input
            type="text"
            name="shortDesc"
            value={formData.shortDesc}
            onChange={handleChange}
            className="input w-full"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Повний опис *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            className="input w-full"
          />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            URL зображення
          </label>
          <input
            type="url"
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleChange}
            className="input w-full"
          />
        </div>

        {/* Category & Level */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Категорія *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="input w-full"
            >
              <option value="">Оберіть категорію</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Рівень *
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
              className="input w-full"
            >
              <option value="BEGINNER">Початковий</option>
              <option value="INTERMEDIATE">Середній</option>
              <option value="ADVANCED">Просунутий</option>
            </select>
          </div>
        </div>

        {/* Price & Duration & Max Students */}
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ціна (₴)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Тривалість (год)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="0"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Макс. студентів
            </label>
            <input
              type="number"
              name="maxStudents"
              value={formData.maxStudents}
              onChange={handleChange}
              min="1"
              className="input w-full"
            />
          </div>
        </div>

        {/* Status - ВАЖЛИВО для адміна */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Статус *
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input w-full"
          >
            <option value="DRAFT">Чернетка</option>
            <option value="PUBLISHED">Опубліковано</option>
            <option value="ARCHIVED">Архівовано</option>
          </select>
          <p className="text-xs mt-1">
            {formData.status === 'PUBLISHED' && (
              <span className="text-green-400">● Студенти можуть записуватись</span>
            )}
            {formData.status === 'DRAFT' && (
              <span className="text-yellow-400">● Курс не видимий студентам</span>
            )}
            {formData.status === 'ARCHIVED' && (
              <span className="text-gray-400">● Курс архівовано</span>
            )}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary flex-1"
          >
            {saving ? 'Збереження...' : 'Зберегти зміни'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/courses')}
            className="btn bg-gray-700 hover:bg-gray-600 text-white flex-1"
          >
            Скасувати
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCourseForAdmin;

