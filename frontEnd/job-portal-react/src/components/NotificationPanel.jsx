import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Bell, BellRing, Briefcase, Calendar, CheckCircle, Clock, Mail, Star, X, AlertTriangle } from 'lucide-react';
import { notificationApi } from '../api/NotificationApi';
import { useAuth } from '../context/AuthProvider';

// Icon map giữ nguyên
const typeConfig = {
  JOB_CREATED: { icon: Briefcase, color: 'text-blue-600', title: 'Job Posted' },
  JOB_UPDATED: { icon: CheckCircle, color: 'text-green-600', title: 'Job Updated' },
  JOB_DELETED: { icon: X, color: 'text-red-600', title: 'Job Deleted' },
  JOB_REPORTED: { icon: AlertTriangle, color: 'text-red-600', title: 'Job Reported' },
  REPORT_RECEIVED: { icon: Mail, color: 'text-yellow-600', title: 'New Report' },
  CV_UPLOADED: { icon: CheckCircle, color: 'text-green-600', title: 'CV Uploaded' },
  APPLICATION_RECEIVED: { icon: Star, color: 'text-purple-600', title: 'Application Received' },
  DEFAULT: { icon: Bell, color: 'text-gray-600', title: 'Notification' }
};

export function NotificationPanel() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?.id || !token) return;

    const fetchNotifications = async () => {
      try {
        const data = await notificationApi.getUserNotifications(user.id, token);
        const formatted = data.map((n) => ({
          id: n.id,
          type: n.type || 'DEFAULT',
          message: n.message,
          createdAt: n.createdAt,
          unread: !n.isRead
        }));
        setNotifications(formatted);
      } catch (err) {
        console.error("❌ Failed to load notifications:", err);
      }
    };

    // Delay 300ms để AuthContext chắc chắn có token
    const timer = setTimeout(fetchNotifications, 300);

    // Không dùng Authorization trong EventSource vì nó không hỗ trợ header
    const eventSource = new EventSource(`http://localhost:8080/api/notifications/stream/${user.id}`);

    eventSource.addEventListener('notification', (event) => {
      try {
        const newNotif = JSON.parse(event.data);
        setNotifications((prev) => [newNotif, ...prev]);
      } catch (e) {
        console.error('Error parsing SSE event:', e);
      }
    });

    eventSource.onerror = () => console.warn('⚠️ SSE disconnected');

    return () => {
      eventSource.close();
      clearTimeout(timer);
    };
  }, [user?.id, token]);


  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = async (id) => {
    await notificationApi.markAsRead(id, token);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => n.unread).map((n) => n.id);
    await Promise.all(unreadIds.map((id) => notificationApi.markAsRead(id, token)));
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const deleteNotification = async (id) => {
    try {
      await notificationApi.deleteNotification(id, token);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("❌ Failed to delete notification:", err);
    }
  };

  function formatDate(value) {
    if (!value) return "Just now";

    // 1) Nếu là object kiểu LocalDateTime JSON { year, month, day, hour, minute, second, nano? }
    if (typeof value === "object") {
      const { year, month, day, hour = 0, minute = 0, second = 0, nano = 0 } = value;
      if (year && month && day) {
        // month - 1 vì Date dùng base 0
        const msFromNano = Math.floor((nano || 0) / 1_000_000);
        const d = new Date(year, month - 1, day, hour, minute, second, msFromNano);
        return d.toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    // 2) Nếu là số (epoch)
    if (typeof value === "number") {
      let t = value;
      // nếu là epoch ở micro hoặc nano (rất lớn) -> chuyển về ms
      if (String(t).length > 13) {
        // heuristics: nếu >= 16 chữ số => có thể là ns or µs
        if (String(t).length >= 16) t = Math.floor(t / 1_000_000); // ns -> ms
        else t = Math.floor(t / 1000); // µs -> ms
      }
      const d = new Date(t);
      return isNaN(d.getTime()) ? "Invalid Date" : d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // 3) Nếu là chuỗi
    if (typeof value === "string") {
      const s = value.trim();

      // 3a) chỉ là số trong chuỗi -> parse như số epoch
      if (/^\d+$/.test(s)) {
        const num = Number(s);
        return formatDate(num);
      }

      // 3b) Nếu là ISO-like (có T) hoặc "yyyy-MM-dd HH:mm:ss"
      try {
        // nếu không có T thì thay bằng T (ví dụ "2025-11-05 14:00:37")
        let iso = s.includes("T") ? s : s.replace(" ", "T");
        // nếu không có timezone, thử thêm Z (UTC) — tùy backend bạn muốn local hay UTC
        if (!/[zZ]|[+\-]\d{2}:\d{2}$/.test(iso)) {
          iso = iso + "Z";
        }
        const d = new Date(iso);
        if (!isNaN(d.getTime())) {
          return d.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      } catch (err) {
        // tiếp xuống fallback
      }

      // cuối cùng thử parse mặc định
      const d2 = new Date(s);
      return isNaN(d2.getTime()) ? "Invalid Date" : d2.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return "Invalid Date";
  }


  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? <BellRing className="size-4" /> : <Bell className="size-4" />}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-96 p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center justify-between">
            Notifications
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notifications`
              : 'All caught up!'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] px-6">
          <div className="space-y-4 pb-6">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bell className="size-12 mx-auto mb-4 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const conf = typeConfig[n.type] || typeConfig.DEFAULT;
                const Icon = conf.icon;
                return (
                  <Card
                    key={n.id}
                    className={`cursor-pointer transition-colors ${n.unread ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`size-8 rounded-full bg-gray-100 flex items-center justify-center ${conf.color}`}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className="font-medium text-sm line-clamp-1">{conf.title}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(n.id);
                              }}
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="size-3 mr-1" />
                              <span>{formatDate(n.createdAt)}</span>
                            </div>
                            {n.unread && <div className="size-2 bg-blue-600 rounded-full"></div>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
