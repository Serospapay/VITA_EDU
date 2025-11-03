import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Stats {
  totalCourses: number;
  totalTeachers: number;
  totalLessons: number;
  totalStudents: number;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price?: number;
  level: string;
  teacher: {
    firstName: string;
    lastName: string;
  };
  category?: {
    name: string;
  };
  _count: {
    enrollments: number;
    lessons: number;
  };
}

const HomePage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch published courses to get stats
      const [coursesRes] = await Promise.all([
        api.get('/courses?status=PUBLISHED&limit=100'),
      ]);

      const courses = coursesRes.data.data.courses || [];
      
      // Calculate stats
      const uniqueTeachers = new Set(courses.map((c: Course) => `${c.teacher.firstName}-${c.teacher.lastName}`));
      const totalLessons = courses.reduce((sum: number, c: Course) => sum + (c._count.lessons || 0), 0);
      const totalStudents = courses.reduce((sum: number, c: Course) => sum + (c._count.enrollments || 0), 0);

      setStats({
        totalCourses: courses.length,
        totalTeachers: uniqueTeachers.size,
        totalLessons,
        totalStudents,
      });

      // Get featured courses (top 3 by enrollments)
      const featured = courses
        .sort((a: Course, b: Course) => (b._count.enrollments || 0) - (a._count.enrollments || 0))
        .slice(0, 3);
      setFeaturedCourses(featured);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to default stats
      setStats({
        totalCourses: 3,
        totalTeachers: 3,
        totalLessons: 9,
        totalStudents: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="hero-gradient min-h-[90vh] flex items-center justify-center relative overflow-hidden">
        {/* Enhanced Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          {/* Additional gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-indigo-900/20"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(167, 139, 250, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(167, 139, 250, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12 animate-fade-in">
            <h1 className="hero-title text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 leading-tight tracking-tight">
              <span className="inline-block bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl">
                VITA-Edu
              </span>
            </h1>
            <p className="hero-subtitle text-2xl sm:text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
              Твій шлях у світ технологій
            </p>
            <p className="hero-text text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-white/90">
              Професійна онлайн-платформа для навчання IT. Курси від практиків, 
              реальні проекти, сучасний стек технологій.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up mb-8">
            <Link to="/register" className="btn-gradient btn-lg group relative overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                <span>Почати навчання</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <span className="btn-shine"></span>
            </Link>
            <Link to="/courses" className="btn-glass btn-lg group">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Переглянути курси
              </span>
            </Link>
          </div>

          {/* Minimal Stats */}
          <div className="mt-16 sm:mt-20 flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-5xl sm:text-6xl md:text-7xl font-black mb-2 text-white">
                {loading ? <span className="animate-pulse">...</span> : stats?.totalCourses || 0}
              </div>
              <div className="text-sm sm:text-base text-white/60 font-medium">Активних курсів</div>
            </div>
            
            <div className="hidden sm:block w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            
            <div className="text-center">
              <div className="text-5xl sm:text-6xl md:text-7xl font-black mb-2 text-white">
                {loading ? <span className="animate-pulse">...</span> : stats?.totalTeachers || 0}
              </div>
              <div className="text-sm sm:text-base text-white/60 font-medium">Викладачів</div>
            </div>
            
            <div className="hidden sm:block w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            
            <div className="text-center">
              <div className="text-5xl sm:text-6xl md:text-7xl font-black mb-2 text-white">
                {loading ? <span className="animate-pulse">...</span> : stats?.totalLessons || 0}
              </div>
              <div className="text-sm sm:text-base text-white/60 font-medium">Уроків</div>
            </div>
            
            <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            
            <div className="text-center">
              <div className="text-5xl sm:text-6xl md:text-7xl font-black mb-2 text-white">
                {loading ? <span className="animate-pulse">...</span> : stats?.totalStudents || 0}
              </div>
              <div className="text-sm sm:text-base text-white/60 font-medium">Студентів</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block z-10">
          <div className="scroll-indicator"></div>
        </div>
      </section>

      {/* Featured Courses Section */}
      {featuredCourses.length > 0 && (
        <section className="py-20 sm:py-24 md:py-32 relative bg-gradient-to-b from-gray-900 via-[#0a0b14] to-[#0a0b14]">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(167,139,250,0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 animate-fade-in">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-semibold text-purple-300">
                  Топ курси
                </span>
              </div>
              <h2 className="section-title text-4xl sm:text-5xl md:text-6xl font-black mb-4">
                Популярні курси
              </h2>
              <p className="section-subtitle text-lg sm:text-xl md:text-2xl font-semibold max-w-2xl mx-auto">
                Оберіть курс, який відкриє для вас нові можливості
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredCourses.map((course, index) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="glass p-6 rounded-2xl hover:scale-[1.02] transition-all group border border-gray-700 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Image with overlay */}
                  <div className="relative w-full h-48 rounded-xl mb-4 overflow-hidden group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all">
                    {course.thumbnail ? (
                      <>
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center">
                        <svg className="w-20 h-20 text-purple-500/30 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    {/* Popular badge */}
                    {index === 0 && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        #1
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {course.category && (
                      <span className="badge badge-primary text-xs px-3 py-1">{course.category.name}</span>
                    )}
                    <span className="badge bg-gray-700/50 text-white text-xs px-3 py-1 border border-gray-600">
                      {course.level === 'BEGINNER' ? 'Початковий' : 
                       course.level === 'INTERMEDIATE' ? 'Середній' : 'Просунутий'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-400 transition line-clamp-2 min-h-[3.5rem]">
                    {course.title}
                  </h3>
                  <p className="text-gray-400 mb-4 line-clamp-2 text-sm leading-relaxed">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mb-4 pb-4 border-b border-gray-700/50">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {course.teacher.firstName} {course.teacher.lastName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {course._count.enrollments || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      {course.price !== undefined && course.price > 0 ? (
                        <div>
                          <p className="text-2xl font-black text-purple-400">{course.price} ₴</p>
                          <p className="text-xs text-gray-500 line-through">{Math.round(course.price * 1.2)} ₴</p>
                        </div>
                      ) : (
                        <p className="text-xl font-bold text-green-400 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Безкоштовно
                        </p>
                      )}
                    </div>
                    <div className="btn btn-primary text-sm px-6 py-2.5 group-hover:scale-105 transition-transform">
                      Детальніше →
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10 sm:mt-12">
              <Link 
                to="/courses" 
                className="btn-glass btn-lg inline-flex items-center gap-2 group/btn"
              >
                <span>Переглянути всі курси</span>
                <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 sm:py-24 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="section-title text-5xl md:text-6xl font-black mb-6">
              Чому обирають VITA-Edu?
            </h2>
            <p className="section-subtitle text-2xl md:text-3xl font-semibold">
              Найкраща IT-освіта для твоєї успішної кар'єри
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature Card 1 */}
            <div className="feature-card group animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="feature-title text-2xl font-bold mb-4">
                Сучасні технології
              </h3>
              <p className="feature-text text-lg leading-relaxed">
                Вивчай React, Node.js, Python, Flutter та інші актуальні технології від практикуючих розробників
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="feature-card group animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="feature-title text-2xl font-bold mb-4">
                Досвідчені ментори
              </h3>
              <p className="feature-text text-lg leading-relaxed">
                Навчайся у професіоналів з реальним досвідом роботи в топових IT-компаніях
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="feature-card group animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="feature-icon mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="feature-title text-2xl font-bold mb-4">
                Практичні проекти
              </h3>
              <p className="feature-text text-lg leading-relaxed">
                Створюй реальні додатки, наповнюй портфоліо та отримуй досвід комерційної розробки
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="feature-card group animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="feature-icon mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="feature-title text-2xl font-bold mb-4">
                Від нуля до Junior
              </h3>
              <p className="feature-text text-lg leading-relaxed">
                Повний шлях від початківця до першої роботи в IT з підтримкою на кожному етапі
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="feature-card group animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="feature-icon mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="feature-title text-2xl font-bold mb-4">
                Спільнота
              </h3>
              <p className="feature-text text-lg leading-relaxed">
                Чат, форум, нетворкінг з однодумцями та викладачами. Підтримка 24/7
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="feature-card group animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="feature-icon mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="feature-title text-2xl font-bold mb-4">
                Сертифікати
              </h3>
              <p className="feature-text text-lg leading-relaxed">
                Отримай офіційний сертифікат після завершення курсу для твого резюме
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 md:py-32 relative bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Готовий розпочати свою{' '}
            <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              IT-кар'єру?
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
            Приєднуйся до тисяч студентів, які вже навчаються на VITA-Edu та будують свою кар'єру в IT
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/register" 
              className="btn-gradient btn-lg inline-flex items-center gap-2 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>Розпочати безкоштовно</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <span className="btn-shine"></span>
            </Link>
            <Link 
              to="/courses" 
              className="btn-glass btn-lg inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Переглянути курси
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-6 sm:gap-8 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Безкоштовна реєстрація
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Безпечні платежі
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Гарантія якості
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
