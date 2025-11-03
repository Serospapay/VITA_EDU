import { PrismaClient, Role, CourseStatus, CourseLevel } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting VITA-Edu database seeding...');

  // Clear existing data
  await prisma.answer.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin
  await prisma.user.create({
    data: {
      email: 'admin@vitaedu.com',
      password: hashedPassword,
      firstName: 'Адміністратор',
      lastName: 'VITA-Edu',
      role: Role.ADMIN,
      emailVerified: true,
      bio: 'Головний адміністратор платформи VITA-Edu',
    },
  });
  console.log('✅ Admin created');

  // Create Teachers
  const teachers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'dmytro.koval@vitaedu.com',
        password: hashedPassword,
        firstName: 'Дмитро',
        lastName: 'Коваль',
        role: Role.TEACHER,
        emailVerified: true,
        bio: 'Senior Full-Stack Developer з 8+ роками досвіду. Спеціалізується на React, Node.js та сучасних веб-технологіях.',
      },
    }),
    prisma.user.create({
      data: {
        email: 'olena.sydorenko@vitaedu.com',
        password: hashedPassword,
        firstName: 'Олена',
        lastName: 'Сидоренко',
        role: Role.TEACHER,
        emailVerified: true,
        bio: 'Frontend та UI/UX експерт з фокусом на доступність та продуктивність.',
      },
    }),
    prisma.user.create({
      data: {
        email: 'andrii.melnyk@vitaedu.com',
        password: hashedPassword,
        firstName: 'Андрій',
        lastName: 'Мельник',
        role: Role.TEACHER,
        emailVerified: true,
        bio: 'Backend Architect, фахівець з Node.js, Python та мікросервісної архітектури.',
      },
    }),
  ]);
  console.log('✅ Teachers created');

  // Create Students (15 realistic students)
  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'ivan.petrenko@student.vitaedu.com',
        password: hashedPassword,
        firstName: 'Іван',
        lastName: 'Петренко',
        role: Role.STUDENT,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'maria.kovalenko@student.vitaedu.com',
        password: hashedPassword,
        firstName: 'Марія',
        lastName: 'Коваленко',
        role: Role.STUDENT,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'oleg.bondarenko@student.vitaedu.com',
        password: hashedPassword,
        firstName: 'Олег',
        lastName: 'Бондаренко',
        role: Role.STUDENT,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'anna.moroz@student.vitaedu.com',
        password: hashedPassword,
        firstName: 'Анна',
        lastName: 'Мороз',
        role: Role.STUDENT,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'maksym.shevchenko@student.vitaedu.com',
        password: hashedPassword,
        firstName: 'Максим',
        lastName: 'Шевченко',
        role: Role.STUDENT,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'yulia.tarasenko@student.vitaedu.com',
        password: hashedPassword,
        firstName: 'Юлія',
        lastName: 'Тарасенко',
        role: Role.STUDENT,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'denys.lysenko@student.vitaedu.com',
        password: hashedPassword,
        firstName: 'Денис',
        lastName: 'Лисенко',
        role: Role.STUDENT,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'victoria.polishchuk@student.vitaedu.com',
        password: hashedPassword,
        firstName: 'Вікторія',
        lastName: 'Поліщук',
        role: Role.STUDENT,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bohdan.kravchenko@student.vitaedu.com',
        password: hashedPassword,
        firstName: 'Богдан',
        lastName: 'Кравченко',
        role: Role.STUDENT,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sofia.melnyk@student.vitaedu.com',
        password: hashedPassword,
        firstName: 'Софія',
        lastName: 'Мельник',
        role: Role.STUDENT,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'artem.kovtun@student.vitaedu.com',
        password: hashedPassword,
        firstName: 'Артем',
        lastName: 'Ковтун',
        role: Role.STUDENT,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'daria.marchenko@student.vitaedu.com',
        password: hashedPassword,
        firstName: 'Дар\'я',
        lastName: 'Марченко',
        role: Role.STUDENT,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'roman.savchuk@student.vitaedu.com',
        password: hashedPassword,
        firstName: 'Роман',
        lastName: 'Савчук',
        role: Role.STUDENT,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'kateryna.oliynyk@student.vitaedu.com',
        password: hashedPassword,
        firstName: 'Катерина',
        lastName: 'Олійник',
        role: Role.STUDENT,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'vadym.rudenko@student.vitaedu.com',
        password: hashedPassword,
        firstName: 'Вадим',
        lastName: 'Руденко',
        role: Role.STUDENT,
        emailVerified: true,
      },
    }),
  ]);
  console.log('✅ Students created');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Frontend розробка',
        slug: 'frontend',
        description: 'Курси з frontend розробки',
        color: '#3b82f6',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Backend розробка',
        slug: 'backend',
        description: 'Курси з backend розробки',
        color: '#10b981',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Full-Stack',
        slug: 'fullstack',
        description: 'Повний цикл веб-розробки',
        color: '#8b5cf6',
      },
    }),
  ]);
  console.log('✅ Categories created');

  // Create Courses
  const fullStackCourse = await prisma.course.create({
    data: {
      title: 'Full-Stack розробка на MERN Stack',
      slug: 'fullstack-mern',
      description: 'Повний курс з розробки сучасних веб-додатків використовуючи MongoDB, Express, React та Node.js. Вивчіть все від основ до deployment в production.',
      shortDesc: 'Станьте Full-Stack розробником за 3 місяці',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.INTERMEDIATE,
      duration: 180,
      price: 12000,
      maxStudents: 30,
      teacherId: teachers[0].id,
      categoryId: categories[2].id,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-31'),
    },
  });

  const reactCourse = await prisma.course.create({
    data: {
      title: 'React та Next.js - сучасна frontend розробка',
      slug: 'react-nextjs',
      description: 'Глибоке вивчення React та Next.js з практичними проектами. TypeScript, Redux, Server Components, SSR, та багато іншого.',
      shortDesc: 'Опануйте React та Next.js на професійному рівні',
      thumbnail: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800',
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.ADVANCED,
      duration: 120,
      price: 9500,
      maxStudents: 25,
      teacherId: teachers[1].id,
      categoryId: categories[0].id,
      startDate: new Date('2024-09-15'),
      endDate: new Date('2024-12-15'),
    },
  });

  const nodeCourse = await prisma.course.create({
    data: {
      title: 'Node.js Backend розробка',
      slug: 'nodejs-backend',
      description: 'Створюйте потужні backend додатки з Node.js, Express, PostgreSQL та MongoDB. Аутентифікація, безпека, тестування та deployment.',
      shortDesc: 'Backend розробка з нуля до production',
      thumbnail: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=800',
      status: CourseStatus.PUBLISHED,
      level: CourseLevel.INTERMEDIATE,
      duration: 150,
      price: 10500,
      maxStudents: 20,
      teacherId: teachers[2].id,
      categoryId: categories[1].id,
      startDate: new Date('2024-10-01'),
      endDate: new Date('2025-01-15'),
    },
  });

  console.log('✅ Courses created');

  // Enroll students to courses
  const enrollments: any[] = [];
  
  // Full-Stack course - 10 students
  for (let i = 0; i < 10; i++) {
    enrollments.push(
      prisma.enrollment.create({
        data: {
          userId: students[i].id,
          courseId: fullStackCourse.id,
          status: 'ACTIVE',
          progress: Math.floor(Math.random() * 70) + 10,
          enrolledAt: new Date('2024-09-01'),
        },
      })
    );
  }

  // React course - 8 students
  for (let i = 2; i < 10; i++) {
    enrollments.push(
      prisma.enrollment.create({
        data: {
          userId: students[i].id,
          courseId: reactCourse.id,
          status: 'ACTIVE',
          progress: Math.floor(Math.random() * 60) + 20,
          enrolledAt: new Date('2024-09-15'),
        },
      })
    );
  }

  // Node.js course - 7 students
  for (let i = 0; i < 7; i++) {
    enrollments.push(
      prisma.enrollment.create({
        data: {
          userId: students[i].id,
          courseId: nodeCourse.id,
          status: 'ACTIVE',
          progress: Math.floor(Math.random() * 50) + 15,
          enrolledAt: new Date('2024-10-01'),
        },
      })
    );
  }

  await Promise.all(enrollments);
  console.log('✅ Enrollments created');

  // Create Lessons for Full-Stack course
  await Promise.all([
    prisma.lesson.create({
      data: {
        title: 'Налаштування проекту та створення першого API',
        slug: 'setup-first-api',
        content: `
Створимо базовий сервер на Express, який буде обробляти HTTP запити.

Створіть папку проекту і виконайте:
\`\`\`bash
npm init -y
npm install express
\`\`\`

Створіть файл server.js:
\`\`\`javascript
const express = require('express');
const app = express();

app.use(express.json());

const users = [
  { id: 1, name: 'Олександр', email: 'alex@example.com' },
  { id: 2, name: 'Марина', email: 'marina@example.com' }
];

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });
  res.json(user);
});

app.post('/api/users', (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name,
    email: req.body.email
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.listen(3000, () => console.log('Server on port 3000'));
\`\`\`

Запустіть: \`node server.js\`

Протестуйте в браузері: http://localhost:3000/api/users

**Завдання:** Додайте endpoints для оновлення (PUT) та видалення (DELETE) користувачів.
        `,
        type: 'VIDEO',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 45,
        order: 1,
        isPublished: true,
        courseId: fullStackCourse.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'Підключення MongoDB та CRUD операції',
        slug: 'mongodb-crud',
        content: `
Встановіть MongoDB драйвер:
\`\`\`bash
npm install mongodb
\`\`\`

Підключення до бази:
\`\`\`javascript
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function run() {
  await client.connect();
  const db = client.db('myapp');
  const users = db.collection('users');

  // Створення
  await users.insertOne({
    name: 'Петро',
    email: 'petro@mail.com',
    age: 25
  });

  // Читання всіх
  const allUsers = await users.find().toArray();
  console.log(allUsers);

  // Пошук одного
  const user = await users.findOne({ email: 'petro@mail.com' });
  
  // Оновлення
  await users.updateOne(
    { email: 'petro@mail.com' },
    { $set: { age: 26 } }
  );

  // Видалення
  await users.deleteOne({ email: 'petro@mail.com' });

  await client.close();
}

run().catch(console.error);
\`\`\`

**Завдання:** Створіть базу даних для списку завдань (todos) з полями: text, completed, createdAt. Реалізуйте всі CRUD операції.
        `,
        type: 'VIDEO',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 60,
        order: 2,
        isPublished: true,
        courseId: fullStackCourse.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'JWT аутентифікація - реєстрація та логін',
        slug: 'jwt-auth-implementation',
        content: `
Встановіть пакети:
\`\`\`bash
npm install jsonwebtoken bcrypt
\`\`\`

Реєстрація користувача:
\`\`\`javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const users = []; // В реальному проекті - база даних

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Користувач вже існує' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = {
    id: users.length + 1,
    email,
    password: hashedPassword
  };
  
  users.push(user);

  const token = jwt.sign({ id: user.id }, 'SECRET_KEY', { expiresIn: '24h' });
  
  res.json({ token, user: { id: user.id, email: user.email } });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Невірні дані' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Невірні дані' });
  }

  const token = jwt.sign({ id: user.id }, 'SECRET_KEY', { expiresIn: '24h' });
  
  res.json({ token, user: { id: user.id, email: user.email } });
});

// Middleware для перевірки токена
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Токен відсутній' });
  }

  try {
    const decoded = jwt.verify(token, 'SECRET_KEY');
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Невірний токен' });
  }
}

// Захищений роут
app.get('/api/profile', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  res.json({ id: user.id, email: user.email });
});
\`\`\`

**Завдання:** Додайте endpoints для зміни пароля та видалення акаунта з перевіркою токена.
        `,
        type: 'VIDEO',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 75,
        order: 3,
        isPublished: true,
        courseId: fullStackCourse.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'Робота з файлами - завантаження та зберігання',
        slug: 'file-upload-handling',
        content: `
Встановіть multer для роботи з файлами:
\`\`\`bash
npm install multer
\`\`\`

Налаштування завантаження:
\`\`\`javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Тільки зображення та PDF дозволені'));
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

// Один файл
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не завантажено' });
  }
  
  res.json({
    message: 'Файл завантажено',
    filename: req.file.filename,
    path: '/uploads/' + req.file.filename
  });
});

// Множинні файли
app.post('/api/upload-multiple', upload.array('files', 5), (req, res) => {
  const files = req.files.map(f => ({
    filename: f.filename,
    path: '/uploads/' + f.filename
  }));
  
  res.json({ message: 'Файли завантажено', files });
});

// Віддача файлів
const express = require('express');
app.use('/uploads', express.static('uploads'));
\`\`\`

**Завдання:** Створіть endpoint для завантаження аватарки користувача з обмеженням розміру 2MB та видаленням старого файлу.
        `,
        type: 'VIDEO',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 80,
        order: 4,
        isPublished: true,
        courseId: fullStackCourse.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'React - створення форми з валідацією',
        slug: 'react-forms-validation',
        content: `
Створимо форму реєстрації з перевіркою даних:

\`\`\`jsx
import { useState } from 'react';

function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email.includes('@')) {
      newErrors.email = 'Невірний email';
    }
    
    if (formData.password.length < 6) {
      newErrors.password = 'Мінімум 6 символів';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Паролі не співпадають';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        alert('Реєстрація успішна!');
      } else {
        setErrors({ server: data.error });
      }
    } catch (error) {
      setErrors({ server: 'Помилка з\'єднання' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      {errors.email && <span style={{color: 'red'}}>{errors.email}</span>}

      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Пароль"
      />
      {errors.password && <span style={{color: 'red'}}>{errors.password}</span>}

      <input
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Підтвердіть пароль"
      />
      {errors.confirmPassword && <span style={{color: 'red'}}>{errors.confirmPassword}</span>}

      {errors.server && <div style={{color: 'red'}}>{errors.server}</div>}

      <button type="submit">Зареєструватися</button>
    </form>
  );
}
\`\`\`

**Завдання:** Додайте поля для імені та прізвища з перевіркою, що вони не порожні та містять мінімум 2 символи.
        `,
        type: 'VIDEO',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 90,
        order: 5,
        isPublished: true,
        courseId: fullStackCourse.id,
      },
    }),
  ]);

  console.log('✅ Full-Stack lessons created');

  // Create Lessons for React course
  await Promise.all([
    prisma.lesson.create({
      data: {
        title: 'Custom Hooks - створення власних хуків',
        slug: 'custom-hooks',
        content: `
Створимо кастомний хук для роботи з API:

\`\`\`jsx
import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Помилка завантаження');
        }
        
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// Використання:
function UsersList() {
  const { data: users, loading, error } = useFetch('/api/users');

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
\`\`\`

Хук для форми:
\`\`\`jsx
function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });
  };

  const reset = () => {
    setValues(initialValues);
  };

  return { values, handleChange, reset };
}

// Використання:
function LoginForm() {
  const { values, handleChange, reset } = useForm({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(values);
    reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" value={values.email} onChange={handleChange} />
      <input name="password" value={values.password} onChange={handleChange} type="password" />
      <button type="submit">Увійти</button>
    </form>
  );
}
\`\`\`

**Завдання:** Створіть хук useDebounce для затримки виконання пошуку (корисно для живого пошуку).
        `,
        type: 'VIDEO',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 70,
        order: 1,
        isPublished: true,
        courseId: reactCourse.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'React Context для глобального стану',
        slug: 'react-context',
        content: `
Створимо контекст для аутентифікації:

\`\`\`jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        return { success: true };
      }
      
      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: 'Помилка з\'єднання' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth має бути всередині AuthProvider');
  }
  return context;
}
\`\`\`

Використання в App.js:
\`\`\`jsx
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </AuthProvider>
  );
}
\`\`\`

Використання в компонентах:
\`\`\`jsx
import { useAuth } from './AuthContext';

function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Вітаємо, {user.email}!</h1>
      <button onClick={logout}>Вийти</button>
    </div>
  );
}
\`\`\`

**Завдання:** Створіть ThemeContext для перемикання теми (світла/темна) з збереженням вибору в localStorage.
        `,
        type: 'VIDEO',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 85,
        order: 2,
        isPublished: true,
        courseId: reactCourse.id,
      },
    }),
  ]);

  console.log('✅ React lessons created');

  // Create Lessons for Node.js course
  await Promise.all([
    prisma.lesson.create({
      data: {
        title: 'Валідація даних та обробка помилок',
        slug: 'validation-error-handling',
        content: `
Встановіть пакет для валідації:
\`\`\`bash
npm install joi
\`\`\`

Створення схеми валідації:
\`\`\`javascript
const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Невірний формат email',
    'any.required': 'Email обов\'язковий'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Пароль має бути мінімум 6 символів',
    'any.required': 'Пароль обов\'язковий'
  }),
  name: Joi.string().min(2).max(50).required()
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }
    
    next();
  };
};

app.post('/api/register', validate(userSchema), async (req, res) => {
  // Дані вже валідні
  const { email, password, name } = req.body;
  // ... створення користувача
});
\`\`\`

Централізована обробка помилок:
\`\`\`javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Middleware для обробки помилок (має бути останнім)
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Непередбачувані помилки
  res.status(500).json({
    error: 'Щось пішло не так'
  });
});

// Використання:
app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw new AppError('Користувача не знайдено', 404);
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});
\`\`\`

Async wrapper для уникнення try-catch:
\`\`\`javascript
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

app.get('/api/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));
\`\`\`

**Завдання:** Створіть схему валідації для створення поста з полями: title (3-100 символів), content (10-5000 символів), tags (масив, макс 5 елементів).
        `,
        type: 'VIDEO',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 65,
        order: 1,
        isPublished: true,
        courseId: nodeCourse.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'WebSocket - real-time комунікація',
        slug: 'websocket-realtime',
        content: `
Встановіть socket.io:
\`\`\`bash
npm install socket.io
\`\`\`

Налаштування серверу:
\`\`\`javascript
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
});

const users = new Map(); // зберігання підключених користувачів

io.on('connection', (socket) => {
  console.log('Користувач підключився:', socket.id);

  // Приєднання до чату
  socket.on('join', (username) => {
    users.set(socket.id, username);
    
    // Повідомити всім про нового користувача
    io.emit('user-joined', {
      username,
      totalUsers: users.size
    });
  });

  // Отримання повідомлення
  socket.on('message', (data) => {
    const username = users.get(socket.id);
    
    // Відправити всім, включно з відправником
    io.emit('message', {
      username,
      text: data.text,
      timestamp: new Date()
    });
  });

  // Користувач друкує
  socket.on('typing', () => {
    const username = users.get(socket.id);
    socket.broadcast.emit('user-typing', username);
  });

  // Відключення
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    users.delete(socket.id);
    
    io.emit('user-left', {
      username,
      totalUsers: users.size
    });
  });
});

httpServer.listen(3000, () => {
  console.log('Server on port 3000');
});
\`\`\`

Клієнт (React):
\`\`\`jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username] = useState('User' + Math.floor(Math.random() * 1000));

  useEffect(() => {
    socket.emit('join', username);

    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('message', { text: input });
      setInput('');
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.username}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Відправити</button>
    </div>
  );
}
\`\`\`

**Завдання:** Додайте функціонал приватних повідомлень між користувачами (socket.to(userId).emit()).
        `,
        type: 'VIDEO',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 75,
        order: 2,
        isPublished: true,
        courseId: nodeCourse.id,
      },
    }),
  ]);

  console.log('✅ Node.js lessons created');

  // Create Assignments for Full-Stack course
  const fsAssignment1 = await prisma.assignment.create({
    data: {
      title: 'Створення REST API для блогу',
      description: 'Розробіть повноцінний REST API для блогу з CRUD операціями для постів та коментарів.',
      instructions: `
## Вимоги до завдання:

1. Створіть Express сервер з наступними endpoints:
   - GET /api/posts - отримання всіх постів
   - GET /api/posts/:id - отримання одного поста
   - POST /api/posts - створення поста
   - PUT /api/posts/:id - оновлення поста
   - DELETE /api/posts/:id - видалення поста

2. Підключіть MongoDB та створіть модель Post з полями:
   - title (обов'язкове)
   - content (обов'язкове)
   - author (обов'язкове)
   - createdAt (автоматично)

3. Додайте валідацію вхідних даних

4. Використовуйте async/await для асинхронних операцій

5. Додайте обробку помилок

## Критерії оцінювання:
- Коректність роботи API (40%)
- Якість коду (30%)
- Обробка помилок (20%)
- Валідація даних (10%)
      `,
      type: 'PROJECT',
      maxScore: 100,
      passingScore: 70,
      dueDate: new Date('2024-11-15'),
      allowLateSubmit: true,
      courseId: fullStackCourse.id,
    },
  });

  const fsAssignment2 = await prisma.assignment.create({
    data: {
      title: 'React компонент для ToDo списку',
      description: 'Створіть функціональний компонент ToDo списку з можливістю додавання, видалення та позначення завдань.',
      instructions: `
## Функціональність:

1. Відображення списку завдань
2. Додавання нового завдання через форму
3. Видалення завдання
4. Позначення завдання як виконане
5. Фільтрація (всі/активні/виконані)
6. Збереження в localStorage

## Технічні вимоги:
- Використовуйте функціональні компоненти
- useState для стану
- useEffect для localStorage
- Стилізація за допомогою CSS modules або styled-components

## Бонусні бали:
- TypeScript (+10 балів)
- Тести (+15 балів)
      `,
      type: 'PRACTICAL',
      maxScore: 100,
      passingScore: 60,
      dueDate: new Date('2024-11-20'),
      allowLateSubmit: true,
      courseId: fullStackCourse.id,
    },
  });

  await prisma.assignment.create({
    data: {
      title: 'Тест: JavaScript та React основи',
      description: 'Перевірка знань з JavaScript ES6+ та React',
      type: 'TEST',
      maxScore: 100,
      passingScore: 70,
      timeLimit: 30,
      maxAttempts: 2,
      showCorrectAnswers: true,
      shuffleQuestions: true,
      courseId: fullStackCourse.id,
      questions: {
        create: [
          {
            text: 'Що таке Virtual DOM в React?',
            type: 'SINGLE_CHOICE',
            points: 10,
            order: 0,
            explanation: 'Virtual DOM - це легка копія реального DOM, яка використовується для оптимізації оновлень.',
            options: {
              create: [
                { text: 'Легка копія реального DOM в пам\'яті', isCorrect: true, order: 0 },
                { text: 'База даних для React', isCorrect: false, order: 1 },
                { text: 'Віртуальна машина JavaScript', isCorrect: false, order: 2 },
                { text: 'Інструмент для тестування', isCorrect: false, order: 3 },
              ],
            },
          },
          {
            text: 'Які з наступних є React hooks?',
            type: 'MULTIPLE_CHOICE',
            points: 15,
            order: 1,
            explanation: 'useState, useEffect та useContext - стандартні React hooks.',
            options: {
              create: [
                { text: 'useState', isCorrect: true, order: 0 },
                { text: 'useEffect', isCorrect: true, order: 1 },
                { text: 'useContext', isCorrect: true, order: 2 },
                { text: 'useDOM', isCorrect: false, order: 3 },
              ],
            },
          },
          {
            text: 'Arrow function підтримує hoisting?',
            type: 'TRUE_FALSE',
            points: 10,
            order: 2,
            explanation: 'Arrow functions не підтримують hoisting, на відміну від звичайних функцій.',
            options: {
              create: [
                { text: 'Так', isCorrect: false, order: 0 },
                { text: 'Ні', isCorrect: true, order: 1 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Assignments created');

  // Create submissions with files and GitHub URLs
  const submissions: any[] = [];

  // Student 0 - Full submission with files
  submissions.push(
    prisma.submission.create({
      data: {
        userId: students[0].id,
        assignmentId: fsAssignment1.id,
        content: `Я створив REST API для блогу з усіма необхідними endpoints. 

Використав Express.js та MongoDB з Mongoose. Додав валідацію через express-validator та обробку помилок через custom middleware.

API підтримує:
- CRUD операції для постів
- Пагінацію
- Пошук за заголовком
- Сортування

Всі endpoints протестовані в Postman.`,
        files: ['/uploads/submissions/blog-api-routes-123456.js', '/uploads/submissions/blog-api-models-123457.js'],
        githubUrl: 'https://github.com/ivanpetrenko/blog-api-project',
        status: 'GRADED',
        score: 95,
        maxScore: 100,
        feedback: 'Відмінна робота! Код чистий, добре структурований. Валідація реалізована коректно. Єдине зауваження - можна було додати більше коментарів.',
        submittedAt: new Date('2024-11-10'),
        gradedAt: new Date('2024-11-12'),
      },
    })
  );

  // Student 1 - GitHub only
  submissions.push(
    prisma.submission.create({
      data: {
        userId: students[1].id,
        assignmentId: fsAssignment1.id,
        content: 'API готове, код на GitHub. Використала async/await та try-catch для обробки помилок.',
        githubUrl: 'https://github.com/mariakovalenko/express-blog-api',
        status: 'GRADED',
        score: 88,
        maxScore: 100,
        feedback: 'Гарна робота! Архітектура правильна, але потрібно додати більше перевірок даних.',
        submittedAt: new Date('2024-11-11'),
        gradedAt: new Date('2024-11-13'),
      },
    })
  );

  // Student 2 - Pending with files
  submissions.push(
    prisma.submission.create({
      data: {
        userId: students[2].id,
        assignmentId: fsAssignment1.id,
        content: 'Завдання виконано. Додав авторизацію через JWT та middleware для захисту routes.',
        files: ['/uploads/submissions/api-server-789012.js', '/uploads/submissions/api-config-789013.json'],
        githubUrl: 'https://github.com/olegbondarenko/blog-rest-api',
        status: 'PENDING',
        submittedAt: new Date('2024-11-14'),
      },
    })
  );

  // Student 3 - React assignment
  submissions.push(
    prisma.submission.create({
      data: {
        userId: students[3].id,
        assignmentId: fsAssignment2.id,
        content: `Створила ToDo компонент з усіма вимогами.

Реалізовано:
- Додавання/видалення завдань
- Checkbox для виконаних
- Фільтри (всі, активні, виконані)
- Збереження в localStorage
- TypeScript для типізації

Використала React Hooks та CSS Modules для стилів.`,
        files: ['/uploads/submissions/todo-component-456789.tsx', '/uploads/submissions/todo-styles-456790.module.css'],
        githubUrl: 'https://github.com/annamoroz/react-todo-app',
        status: 'GRADED',
        score: 98,
        maxScore: 100,
        feedback: 'Ідеальна робота! TypeScript використаний правильно, код читабельний. Бонусні бали нараховані.',
        submittedAt: new Date('2024-11-18'),
        gradedAt: new Date('2024-11-19'),
      },
    })
  );

  // Student 4 - Simple text submission
  submissions.push(
    prisma.submission.create({
      data: {
        userId: students[4].id,
        assignmentId: fsAssignment2.id,
        content: 'Завдання готове. Всі функції працюють, тести пройдені.',
        githubUrl: 'https://github.com/maksymshevchenko/todo-list-react',
        status: 'GRADED',
        score: 75,
        maxScore: 100,
        feedback: 'Базова функціональність реалізована, але не вистачає фільтрації та localStorage.',
        submittedAt: new Date('2024-11-19'),
        gradedAt: new Date('2024-11-20'),
      },
    })
  );

  // Student 5 - Pending
  submissions.push(
    prisma.submission.create({
      data: {
        userId: students[5].id,
        assignmentId: fsAssignment2.id,
        content: 'Виконав завдання з додатковими функціями: drag-and-drop для сортування завдань.',
        files: ['/uploads/submissions/advanced-todo-111222.tsx'],
        githubUrl: 'https://github.com/yuliatarasenko/advanced-todo',
        status: 'PENDING',
        submittedAt: new Date('2024-11-20T10:30:00'),
      },
    })
  );

  await Promise.all(submissions);
  console.log('✅ Submissions created');

  console.log('✨ VITA-Edu database seeded successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log('- 1 Admin');
  console.log('- 3 Teachers');
  console.log('- 15 Students');
  console.log('- 3 Categories');
  console.log('- 3 Courses');
  console.log('- 25 Enrollments');
  console.log('- 9 Lessons with content');
  console.log('- 3 Assignments');
  console.log('- 6 Submissions (with files and GitHub)');
  console.log('');
  console.log('🔐 Test accounts (password: password123):');
  console.log('Admin: admin@vitaedu.com');
  console.log('Teacher: dmytro.koval@vitaedu.com');
  console.log('Student: denys.lysenko@student.vitaedu.com');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
