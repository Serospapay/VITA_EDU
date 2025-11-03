import { io, Socket } from 'socket.io-client';

// Get socket URL from environment
// @ts-ignore - Vite environment variables
const SOCKET_URL = import.meta.env.VITE_WS_URL || (() => {
  // @ts-ignore
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace('/api', '').replace('http://', 'ws://').replace('https://', 'wss://');
})();

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Course rooms
  joinCourse(courseId: string) {
    this.socket?.emit('join:course', courseId);
  }

  leaveCourse(courseId: string) {
    this.socket?.emit('leave:course', courseId);
  }

  // Course chat messages
  sendCourseMessage(courseId: string, content: string) {
    this.socket?.emit('course:message:send', { courseId, content });
  }

  onCourseMessageReceived(callback: (data: any) => void) {
    this.socket?.on('course:message:received', callback);
  }

  onCourseMessageSent(callback: (data: any) => void) {
    this.socket?.on('course:message:sent', callback);
  }

  // Private messages (legacy)
  sendMessage(receiverId: string, content: string) {
    this.socket?.emit('message:send', { receiverId, content });
  }

  onMessageReceived(callback: (data: any) => void) {
    this.socket?.on('message:received', callback);
  }

  onMessageSent(callback: (data: any) => void) {
    this.socket?.on('message:sent', callback);
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Typing indicators
  startTyping(receiverId: string) {
    this.socket?.emit('typing:start', receiverId);
  }

  stopTyping(receiverId: string) {
    this.socket?.emit('typing:stop', receiverId);
  }

  onTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
    this.socket?.on('typing:user', callback);
  }

  // Announcements
  sendAnnouncement(courseId: string, title: string, content: string) {
    this.socket?.emit('announcement:send', { courseId, title, content });
  }

  onAnnouncementReceived(callback: (data: any) => void) {
    this.socket?.on('announcement:received', callback);
  }

  // Notifications
  sendNotification(userId: string, title: string, message: string) {
    this.socket?.emit('notification:send', { userId, title, message });
  }

  onNotificationReceived(callback: (data: any) => void) {
    this.socket?.on('notification:received', callback);
  }

  // Remove listeners
  removeListener(event: string) {
    this.socket?.off(event);
  }

  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

export const socketService = new SocketService();
export default socketService;




