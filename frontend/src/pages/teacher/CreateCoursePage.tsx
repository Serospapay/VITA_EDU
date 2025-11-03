import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  color: string;
}

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDesc: '',
    thumbnail: '',
    categoryId: '',
    level: 'BEGINNER',
    status: 'DRAFT',
    price: 0,
    duration: 0,
    maxStudents: 50,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/courses', formData);
      toast.success('Курс успішно створено!');
      navigate(`/teacher/courses/${response.data.data.id}/edit`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка створення курсу');
    } finally {
      setLoading(false);
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

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9а-яіїє]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Створити новий курс
      </h1>

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
            placeholder="Наприклад: React з нуля до професіонала"
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
            placeholder="react-from-zero-to-hero"
          />
          <p className="text-xs text-gray-500 mt-1">
            Автоматично генерується з назви
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
            placeholder="Стисло про курс (1-2 речення)"
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
            placeholder="Детальний опис курсу, що вивчатимуть студенти..."
          />
        </div>

        {/* Thumbnail URL */}
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
            placeholder="https://example.com/image.jpg"
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

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Статус
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
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? 'Створення...' : 'Створити курс'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/teacher/courses')}
            className="btn bg-gray-700 hover:bg-gray-600 text-white flex-1"
          >
            Скасувати
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCoursePage;

