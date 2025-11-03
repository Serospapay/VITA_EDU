import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface EnrolledStudent {
  id: string;
  user: Student;
  progress: number;
  enrolledAt: string;
}

const CourseStudentsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [courseName, setCourseName] = useState('');

  useEffect(() => {
    if (id) {
      fetchCourseData();
      fetchAllStudents();
    }
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, studentsRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/courses/${id}/students`),
      ]);

      setCourseName(courseRes.data.data.title);
      setEnrolledStudents(studentsRes.data.data || []);
    } catch (error: any) {
      toast.error('Помилка завантаження даних');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const response = await api.get('/users?limit=100');
      const usersData = response.data.data;
      const users = usersData.users || usersData;
      const studentsList = users.filter((u: any) => u.role === 'STUDENT');
      setAllStudents(studentsList);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Filter out already enrolled students
    const enrolledIds = enrolledStudents.map((e) => e.user.id);
    const available = allStudents.filter((s) => !enrolledIds.includes(s.id));
    setAvailableStudents(available);
  }, [allStudents, enrolledStudents]);

  const handleEnrollStudent = async () => {
    if (!selectedStudent) {
      toast.error('Оберіть студента');
      return;
    }

    try {
      await api.post('/enrollments/admin', {
        courseId: id,
        studentId: selectedStudent,
      });
      toast.success('Студента записано на курс!');
      setSelectedStudent('');
      fetchCourseData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка запису');
      console.error('Enroll error:', error);
    }
  };

  const handleUnenroll = async (enrollmentId: string) => {
    if (!confirm('Відписати студента від курсу?')) return;

    try {
      await api.delete(`/enrollments/admin/${enrollmentId}`);
      toast.success('Студента відписано');
      fetchCourseData();
    } catch (error) {
      toast.error('Помилка відписування');
      console.error('Unenroll error:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center text-gray-400">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Студенти курсу
          </h1>
          <p className="text-gray-400 mt-2">{courseName}</p>
        </div>
        <button
          onClick={() => navigate('/admin/courses')}
          className="btn bg-gray-700 hover:bg-gray-600 text-white"
        >
          ← Назад до курсів
        </button>
      </div>

      {/* Enroll new student */}
      <div className="glass p-6 rounded-2xl mb-8">
        <h3 className="text-xl font-semibold mb-4 text-white">Записати нового студента</h3>
        <div className="flex gap-4">
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="input flex-1"
          >
            <option value="">Оберіть студента</option>
            {availableStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName} ({student.email})
              </option>
            ))}
          </select>
          <button
            onClick={handleEnrollStudent}
            disabled={!selectedStudent}
            className="btn btn-primary"
          >
            Записати на курс
          </button>
        </div>
        {availableStudents.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Всі студенти вже записані на цей курс
          </p>
        )}
      </div>

      {/* Enrolled students list */}
      <div className="glass p-6 rounded-2xl">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Записані студенти ({enrolledStudents.length})
        </h3>

        {enrolledStudents.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Немає записаних студентів</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-left text-gray-400 font-medium">Студент</th>
                  <th className="py-3 px-4 text-left text-gray-400 font-medium">Email</th>
                  <th className="py-3 px-4 text-left text-gray-400 font-medium">Прогрес</th>
                  <th className="py-3 px-4 text-left text-gray-400 font-medium">Дата запису</th>
                  <th className="py-3 px-4 text-right text-gray-400 font-medium">Дії</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-white">
                        {enrollment.user.firstName} {enrollment.user.lastName}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-400">{enrollment.user.email}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400">{enrollment.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-sm">
                      {new Date(enrollment.enrolledAt).toLocaleDateString('uk-UA')}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleUnenroll(enrollment.id)}
                        className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                      >
                        Відписати
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseStudentsPage;

