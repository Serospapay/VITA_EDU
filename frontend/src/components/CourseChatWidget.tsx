import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../hooks/redux';
import api from '../services/api';
import socketService from '../services/socket.service';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  thumbnail?: string;
  unreadMessages?: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  courseId: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
}

const CourseChatWidget = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('accessToken');
    if (token) {
      socketService.connect(token);
    }

    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Listen for new messages
    const handleMessage = (data: Message) => {
      if (data.courseId === selectedCourse?.id) {
        setMessages(prev => [...prev, data]);
        scrollToBottom();
      } else {
        // Update unread count
        setCourses(prev => prev.map(course => 
          course.id === data.courseId 
            ? { ...course, unreadMessages: (course.unreadMessages || 0) + 1 }
            : course
        ));
      }
    };

    socketService.onCourseMessageReceived(handleMessage);

    return () => {
      socketService.removeListener('course:message:received');
    };
  }, [user, selectedCourse]);

  useEffect(() => {
    if (selectedCourse) {
      fetchMessages();
      joinCourseRoom();
    }

    return () => {
      if (selectedCourse) {
        socketService.leaveCourse(selectedCourse.id);
      }
    };
  }, [selectedCourse]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/messages/courses');
      setCourses(response.data.data || []);
      // Auto-select first course if available
      if (response.data.data && response.data.data.length > 0 && !selectedCourse) {
        setSelectedCourse(response.data.data[0]);
      }
    } catch (error: any) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedCourse) return;

    try {
      setLoading(true);
      const response = await api.get(`/messages/course/${selectedCourse.id}`);
      setMessages(response.data.data || []);
      
      // Mark messages as read
      await api.put(`/messages/course/${selectedCourse.id}/read`);
      
      // Update unread count
      setCourses(prev => prev.map(course => 
        course.id === selectedCourse.id 
          ? { ...course, unreadMessages: 0 }
          : course
      ));
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinCourseRoom = () => {
    if (selectedCourse) {
      socketService.joinCourse(selectedCourse.id);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedCourse) return;

    try {
      socketService.sendCourseMessage(selectedCourse.id, messageInput.trim());
      setMessageInput('');
    } catch (error: any) {
      toast.error('Помилка відправки повідомлення');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const totalUnread = courses.reduce((sum, course) => sum + (course.unreadMessages || 0), 0);

  if (courses.length === 0) {
    return null; // Don't show widget if no courses
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg shadow-purple-500/50 flex items-center justify-center text-white hover:shadow-purple-500/70 transition-all z-40 group"
        title="Чат курсу"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] glass rounded-2xl border border-purple-500/30 shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {courses.length > 1 && (
                <select
                  value={selectedCourse?.id || ''}
                  onChange={(e) => {
                    const course = courses.find(c => c.id === e.target.value);
                    setSelectedCourse(course || null);
                  }}
                  className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title} {course.unreadMessages ? `(${course.unreadMessages})` : ''}
                    </option>
                  ))}
                </select>
              )}
              {courses.length === 1 && selectedCourse && (
                <h3 className="font-semibold text-white truncate">{selectedCourse.title}</h3>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/30"
          >
            {loading ? (
              <div className="text-center text-gray-400 py-8">Завантаження...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>Повідомлень поки немає</p>
                <p className="text-sm mt-2">Почніть розмову!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {message.sender.avatar ? (
                        <img
                          src={message.sender.avatar}
                          alt={`${message.sender.firstName} ${message.sender.lastName}`}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          message.sender.role === 'TEACHER' 
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {message.sender.firstName[0]}{message.sender.lastName[0]}
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex-1 min-w-0 ${isOwnMessage ? 'items-end flex flex-col' : ''}`}>
                      <div className={`inline-block max-w-[80%] rounded-2xl px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-gray-800/50 text-white'
                      }`}>
                        {!isOwnMessage && (
                          <p className="text-xs font-semibold mb-1 opacity-80">
                            {message.sender.firstName} {message.sender.lastName}
                            {message.sender.role === 'TEACHER' && (
                              <span className="ml-2 text-blue-400">👨‍🏫</span>
                            )}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : ''}`}>
                        {new Date(message.createdAt).toLocaleTimeString('uk-UA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700 bg-gray-900/50">
            <div className="flex gap-2">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Напишіть повідомлення..."
                rows={2}
                className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition resize-none text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseChatWidget;

