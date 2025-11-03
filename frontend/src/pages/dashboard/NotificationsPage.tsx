import { useState, useEffect } from 'react';
// import { useAppSelector } from '../../hooks/redux';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationsPage = () => {
  // const { user } = useAppSelector((state) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data || []);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      toast.error('Помилка');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Нотифікацію видалено');
    } catch (error) {
      toast.error('Помилка видалення');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return '✅';
      case 'WARNING':
        return '⚠️';
      case 'ERROR':
        return '❌';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'border-green-500 bg-green-500/10';
      case 'WARNING':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'ERROR':
        return 'border-red-500 bg-red-500/10';
      default:
        return 'border-purple-500 bg-purple-500/10';
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Нотифікації</h1>
        <div className="text-center text-gray-400">Завантаження...</div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Нотифікації
        </h1>
        {unreadCount > 0 && (
          <span className="badge bg-red-500 text-white px-4 py-2">
            {unreadCount} непрочитаних
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="glass p-8 rounded-2xl text-center">
          <p className="text-gray-400">У вас немає нотифікацій</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`glass p-6 rounded-2xl border-l-4 ${getNotificationColor(
                notification.type
              )} ${notification.isRead ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <span className="text-3xl">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-white">{notification.title}</h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-3">{notification.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString('uk-UA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="btn btn-sm bg-purple-500 hover:bg-purple-600 text-white"
                      title="Позначити як прочитане"
                    >
                      👁️
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                    title="Видалити"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;




