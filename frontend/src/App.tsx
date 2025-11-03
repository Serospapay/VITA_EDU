import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CoursesPage from './pages/courses/CoursesPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import LessonViewPage from './pages/courses/LessonViewPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import MyCoursesPage from './pages/dashboard/MyCoursesPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import MyAssignmentsPage from './pages/dashboard/MyAssignmentsPage';
import StudentGradebookPage from './pages/dashboard/StudentGradebook';

// Teacher Pages
import TeacherCoursesPage from './pages/teacher/TeacherCoursesPage';
import CreateCoursePage from './pages/teacher/CreateCoursePage';
import EditCoursePage from './pages/teacher/EditCoursePage';
import TeacherCourseStudentsPage from './pages/teacher/CourseStudentsPage';
import PendingSubmissionsPage from './pages/teacher/PendingSubmissionsPage';
import GradebookPage from './pages/teacher/GradebookPage';
import LessonEditPage from './pages/teacher/LessonEditPage';
import CreateAssignmentPage from './pages/teacher/CreateAssignmentPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import CreateUserPage from './pages/admin/CreateUserPage';
import EditUserPage from './pages/admin/EditUserPage';
import AllCoursesPage from './pages/admin/AllCoursesPage';
import CreateCourseForAdmin from './pages/admin/CreateCourseForAdmin';
import EditCourseForAdmin from './pages/admin/EditCourseForAdmin';
import CourseStudentsPage from './pages/admin/CourseStudentsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Hooks
import { useAppDispatch } from './hooks/redux';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('accessToken');
    if (token) {
      // You would typically verify the token and get user data here
      // For now, we'll just check if token exists
    }
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:id" element={<CourseDetailPage />} />
        <Route path="courses/:courseId/lessons/:lessonId" element={<LessonViewPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="my-courses" element={<MyCoursesPage />} />
        <Route path="courses/:courseId/assignments" element={<MyAssignmentsPage />} />
        <Route path="gradebook" element={<StudentGradebookPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Teacher Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="courses" element={<TeacherCoursesPage />} />
        <Route path="pending" element={<PendingSubmissionsPage />} />
        <Route path="gradebook" element={<GradebookPage />} />
        <Route path="courses/create" element={<CreateCoursePage />} />
        <Route path="courses/:id/edit" element={<EditCoursePage />} />
        <Route path="courses/:id/students" element={<TeacherCourseStudentsPage />} />
        <Route path="courses/:courseId/lessons/:lessonId/edit" element={<LessonEditPage />} />
        <Route path="courses/:courseId/assignments/create" element={<CreateAssignmentPage />} />
        <Route path="assignments/create" element={<CreateAssignmentPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="users/create" element={<CreateUserPage />} />
        <Route path="users/:id/edit" element={<EditUserPage />} />
        <Route path="courses" element={<AllCoursesPage />} />
        <Route path="courses/create" element={<CreateCourseForAdmin />} />
        <Route path="courses/:id/edit" element={<EditCourseForAdmin />} />
        <Route path="courses/:id/students" element={<CourseStudentsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;

