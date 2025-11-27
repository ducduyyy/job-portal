import axios from "axios";

export const notificationApi = {
  getUserNotifications: async (userId, token) => {
    const res = await axios.get(`http://localhost:8080/api/notifications/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  markAsRead: async (notificationId, token) => {
    await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  markAllAsRead: async (userId, token) => {
    await axios.put(`http://localhost:8080/api/notifications/user/${userId}/read-all`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  deleteNotification: async (id, token) => {
    await axios.delete(`http://localhost:8080/api/notifications/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
